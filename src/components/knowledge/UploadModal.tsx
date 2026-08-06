import { useState, useRef, useEffect } from 'react';
import { useKnowledgeStore, DocType } from '@/store/knowledgeStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File, FileText, FileSpreadsheet, Presentation, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { knowledgeApi } from '@/lib/api';
import { useBackendHealth } from '@/hooks/use-backend-health';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected?: (files: File[]) => void;
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx', '.pptx'];

interface QueueItem {
  id: string;
  file: File;
  progress: number;
}

export const UploadModal = ({ isOpen, onClose, onFilesSelected }: UploadModalProps) => {
  const { addDocument, collectionFilter } = useKnowledgeStore();
  const { health } = useBackendHealth();
  // Report the embedding model the backend actually uses, not a hardcoded one.
  const embeddingModel = health?.config.embedding_model ?? 'unknown';
  const { toast } = useToast();

  // 'all' means "no specific collection" — let the backend use its default.
  const targetCollection = collectionFilter && collectionFilter !== 'all' ? collectionFilter : undefined;
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQueue([]);
    }
  }, [isOpen]);

  // Simulate upload progress ticking up for selected files
  useEffect(() => {
    if (queue.length === 0) return;

    const timer = setInterval(() => {
      setQueue(prev => {
        let updated = false;
        const next = prev.map(item => {
          if (item.progress < 100) {
            updated = true;
            // Increments random speed
            const speed = Math.floor(Math.random() * 15) + 5;
            return {
              ...item,
              progress: Math.min(item.progress + speed, 100)
            };
          }
          return item;
        });

        if (!updated) {
          clearInterval(timer);
        }
        return next;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [queue]);

  if (!isOpen) return null;

  const isAcceptedType = (file: File) => {
    const name = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext));
  };

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(isAcceptedType);
    if (validFiles.length === 0) {
      toast({
        title: "Unsupported file formats",
        description: "Please upload PDF, DOCX, TXT, MD, CSV, XLSX, or PPTX.",
        variant: "destructive"
      });
      return;
    }

    const items: QueueItem[] = validFiles.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      progress: 0
    }));

    setQueue(prev => [...prev, ...items]);

    if (onFilesSelected) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSubmit = async () => {
    if (queue.length === 0) return;
    setIsUploading(true);

    toast({
      title: "Uploading documents",
      description: `Starting upload for ${queue.length} file(s)…`,
    });

    let successCount = 0;

    for (const item of queue) {
      const ext = (item.file.name.split('.').pop()?.toLowerCase() as DocType) || 'pdf';
      try {
        // Ingest into the collection currently being viewed, when one is
        // selected — the backend accepts collection_name on /ingest/upload.
        const stats = await knowledgeApi.uploadDocument(item.file, targetCollection);

        addDocument({
          name: stats.file_name || item.file.name,
          collection: stats.collection_name || 'General',
          type: ext,
          status: stats.inserted > 0 ? 'Indexed' : 'Failed',
          chunksCount: stats.inserted,
          sizeBytes: item.file.size,
          owner: 'John Doe',
          language: 'English',
          pagesCount: 1,
          embeddingModel,
        });

        if (stats.inserted === 0) {
          toast({
            title: `No text extracted: ${item.file.name}`,
            description: 'The file was accepted but produced no indexable content.',
            variant: 'destructive',
          });
        }
        successCount++;
      } catch (err: any) {
        toast({
          title: `Failed: ${item.file.name}`,
          description: err.message || 'An error occurred during indexing.',
          variant: 'destructive',
        });

        // Still register the document in the store as Failed
        addDocument({
          name: item.file.name,
          collection: 'General',
          type: ext,
          status: 'Failed',
          chunksCount: 0,
          sizeBytes: item.file.size,
          owner: 'John Doe',
          language: 'English',
          pagesCount: 0,
          embeddingModel,
        });
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} of ${queue.length} file(s) indexed successfully.`,
      });
    }

    setIsUploading(false);
    onClose();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <File className="h-4 w-4 text-red-500 shrink-0" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-500 shrink-0" />;
      case 'docx':
      case 'doc': return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'pptx':
      case 'ppt': return <Presentation className="h-4 w-4 text-orange-500 shrink-0" />;
      case 'md':
      case 'txt': return <FileText className="h-4 w-4 text-slate-500 shrink-0" />;
      default: return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Upload className="h-4.5 w-4.5 text-primary" />
            Upload Documents
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-muted rounded-full">
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.pptx"
            className="hidden"
          />

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragOver 
                ? "border-primary bg-primary/5 scale-[1.01]" 
                : "border-border hover:border-primary/50 hover:bg-muted/15"
            )}
            onClick={handleBrowseClick}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full text-primary shadow-sm">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Drag and drop documents here or click to browse
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Supported formats: PDF, DOCX, TXT, MD, CSV, XLSX, PPTX (Max 25MB)
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs font-semibold mt-1">
                Browse Files
              </Button>
            </div>
          </div>

          {/* Queue Section */}
          {queue.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Upload Queue ({queue.length})
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div 
                    key={item.id}
                    className="border border-border/70 rounded-lg p-2.5 bg-muted/10 flex items-center gap-3 transition-all animate-in zoom-in-95 duration-150"
                  >
                    {getFileIcon(item.file.name)}
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground truncate max-w-[200px]" title={item.file.name}>
                          {item.file.name}
                        </span>
                        <span className="text-muted-foreground font-mono text-[9px]">{formatSize(item.file.size)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Progress value={item.progress} className="h-1 flex-1 bg-muted [&>div]:bg-primary" />
                        <span className="text-[9px] font-semibold text-primary font-mono w-6 text-right">
                          {item.progress}%
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-2.5 bg-muted/10">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 text-xs font-semibold">
            Cancel
          </Button>
          <Button 
            onClick={handleUploadSubmit} 
            disabled={queue.length === 0}
            size="sm" 
            className="h-9 text-xs font-semibold"
          >
            Upload {queue.length > 0 ? `(${queue.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
