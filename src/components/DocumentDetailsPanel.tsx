import { X, File, FileText, FileSpreadsheet, Presentation, RefreshCw, Trash2, Download, Eye, History, FileCheck } from 'lucide-react';
import { useKnowledgeStore, DocumentItem } from '@/store/knowledgeStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

export const DocumentDetailsPanel = () => {
  const {
    activeDetailDocId,
    setActiveDetailDocId,
    documents,
    detailTab,
    setDetailTab,
    reindexDocuments,
    deleteDocuments
  } = useKnowledgeStore();

  const doc = documents.find(d => d.id === activeDetailDocId);

  if (!doc) return null;

  const handleClose = () => {
    setActiveDetailDocId(null);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return <File className="h-5 w-5 text-red-500 shrink-0" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <FileSpreadsheet className="h-5 w-5 text-green-500 shrink-0" />;
      case 'docx':
      case 'doc': return <FileText className="h-5 w-5 text-blue-500 shrink-0" />;
      case 'pptx':
      case 'ppt': return <Presentation className="h-5 w-5 text-orange-500 shrink-0" />;
      case 'md':
      case 'txt': return <FileText className="h-5 w-5 text-slate-500 shrink-0" />;
      default: return <File className="h-5 w-5 text-muted-foreground shrink-0" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Pending' || dateStr === 'Failed') return dateStr;
    return new Date(dateStr).toLocaleString();
  };

  return (
    <>
      {/* Sliding Details Panel Overlay */}
      <div 
        className="fixed inset-0 bg-background/20 backdrop-blur-2xs z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Side drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out"
        )}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            {getFileIcon(doc.type)}
            <h3 className="font-semibold text-foreground text-sm truncate" title={doc.name}>
              {doc.name}
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="h-8 w-8 hover:bg-muted rounded-full shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border text-xs font-semibold select-none bg-muted/20">
          {(['overview', 'preview', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={cn(
                "flex-1 py-3 text-center transition-all capitalize border-b-2 border-transparent text-muted-foreground",
                detailTab === tab && "border-primary text-primary font-bold bg-background"
              )}
            >
              {tab === 'overview' && (
                <span className="flex items-center justify-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5" /> Overview
                </span>
              )}
              {tab === 'preview' && (
                <span className="flex items-center justify-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </span>
              )}
              {tab === 'activity' && (
                <span className="flex items-center justify-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Activity
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Tab Contents */}
        <ScrollArea className="flex-1 p-5">
          {detailTab === 'overview' && (
            <div className="space-y-6">
              {/* Metadata Details Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Document Details
                </h4>
                
                <div className="border border-border rounded-lg overflow-hidden text-xs bg-muted/10">
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Collection</span>
                    <span className="col-span-2 text-foreground font-semibold">{doc.collection}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Owner</span>
                    <span className="col-span-2 text-foreground">{doc.owner}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Upload Date</span>
                    <span className="col-span-2 text-foreground font-mono">{formatDate(doc.lastUpdated)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">File Type</span>
                    <span className="col-span-2 text-foreground uppercase font-mono">{doc.type}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Language</span>
                    <span className="col-span-2 text-foreground">{doc.language}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Pages</span>
                    <span className="col-span-2 text-foreground font-mono">{doc.pagesCount}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">File Size</span>
                    <span className="col-span-2 text-foreground font-mono">{formatSize(doc.sizeBytes)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Embedding Model</span>
                    <span className="col-span-2 text-foreground font-mono">{doc.embeddingModel}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border p-2.5">
                    <span className="text-muted-foreground font-medium">Chunk Count</span>
                    <span className="col-span-2 text-foreground font-mono">{doc.chunksCount}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5">
                    <span className="text-muted-foreground font-medium">Last Indexed</span>
                    <span className="col-span-2 text-foreground font-mono">{formatDate(doc.lastIndexed)}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between border border-border p-3.5 rounded-lg bg-muted/10 text-xs">
                <span className="font-semibold text-muted-foreground">Indexing Status</span>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs",
                  doc.status === 'Indexed' && "bg-green-500/10 text-green-500 border-green-500/20",
                  doc.status === 'Needs Re-index' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                  doc.status === 'Processing' && "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse",
                  doc.status === 'Failed' && "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {doc.status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-4 border-t border-border">
                <Button 
                  onClick={() => reindexDocuments([doc.id])} 
                  disabled={doc.status === 'Processing'}
                  variant="outline" 
                  className="flex-1 text-xs gap-1.5 h-9"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", doc.status === 'Processing' && "animate-spin")} />
                  Re-index
                </Button>
                <Button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
                      deleteDocuments([doc.id]);
                    }
                  }}
                  variant="destructive" 
                  className="flex-1 text-xs gap-1.5 h-9 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 shrink-0" 
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {detailTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                <span>Page 1 of {doc.pagesCount}</span>
                <span>Zoom: Fit Width</span>
              </div>
              
              {/* Document Mockup Visual Preview */}
              <div className="border border-border/80 rounded-lg p-5 bg-background shadow-xs select-none space-y-4 font-serif min-h-[300px] text-xs leading-relaxed text-foreground/80 dark:bg-muted/10">
                <h2 className="font-sans font-bold text-center text-sm border-b border-border/50 pb-3 text-foreground mb-4">
                  {doc.name.replace(/\.[^/.]+$/, "")}
                </h2>
                <p className="indent-4">
                  This represents a proprietary preview mockup for <strong>{doc.name}</strong>. It showcases structural content extracted during document preprocessing.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac sapien non neque lacinia convallis eu et mi. Suspendisse pulvinar, velit ut elementum congue, erat sem ultrices risus, ac facilisis nibh elit ut justo. Proin accumsan, dolor id interdum gravida, mi neque commodo lorem, id ultrices libero felis et nibh.
                </p>
                <p className="indent-4">
                  Aenean imperdiet dictum tellus, eget convallis magna eleifend eu. Ut at sem luctus, scelerisque ligula id, sodales sem. Curabitur vel vulputate nulla. Sed et arcu eget purus porta imperdiet ac eu arcu. Ut porta ex eu velit dapibus scelerisque.
                </p>
                <div className="space-y-2 pt-4 font-sans text-[11px] text-muted-foreground border-t border-border/30">
                  <p className="font-semibold text-foreground">Extract Summary:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Semantic index density: High</li>
                    <li>Confidence validation: Passed</li>
                    <li>OCR match rate: 98%</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {detailTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Audit Trail & History
              </h4>
              
              <div className="relative pl-4 border-l border-border space-y-5 py-2">
                {doc.activityLog.map((log, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Circle timeline dot */}
                    <div className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-background shadow-2xs" />
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{log.action}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                        <span>{formatDate(log.timestamp)}</span>
                        <span>•</span>
                        <span className="font-medium text-primary/80">{log.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
};
