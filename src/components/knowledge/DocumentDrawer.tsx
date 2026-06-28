import { X, File, FileText, FileSpreadsheet, Presentation, RefreshCw, Trash2, Download, Info, Eye, History, FileCheck } from 'lucide-react';
import { useKnowledgeStore, DocumentItem } from '@/store/knowledgeStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const DocumentDrawer = () => {
  const {
    activeDetailDocId,
    setActiveDetailDocId,
    documents,
    detailTab,
    setDetailTab,
    reindexDocuments,
    deleteDocuments
  } = useKnowledgeStore();

  const { toast } = useToast();

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

  const handleReindex = () => {
    reindexDocuments([doc.id]);
    toast({
      title: "Re-indexing requested",
      description: `Indexing job started for ${doc.name}.`
    });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
      deleteDocuments([doc.id]);
      toast({
        title: "Document deleted",
        description: `Removed index entry for ${doc.name}.`
      });
    }
  };

  return (
    <>
      {/* Drawer Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-background/25 backdrop-blur-2xs z-40 transition-all duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Slide sheet container */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen bg-card border-l border-border shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out",
          "w-full sm:w-[420px] md:w-[460px] animate-in slide-in-from-right duration-300"
        )}
      >
        {/* Header panel */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
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
            className="h-8 w-8 hover:bg-muted rounded-full shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
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

        {/* Tab content area */}
        <ScrollArea className="flex-1 p-5">
          {detailTab === 'overview' && (
            <div className="space-y-6">
              {/* Document Information */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Document Information
                </h4>
                <div className="border border-border/80 rounded-xl overflow-hidden text-xs bg-muted/10">
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Collection</span>
                    <span className="col-span-2 text-foreground font-semibold">{doc.collection}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Owner</span>
                    <span className="col-span-2 text-foreground font-semibold">{doc.owner}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Upload Date</span>
                    <span className="col-span-2 text-foreground font-mono">{formatDate(doc.lastUpdated)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Last Modified</span>
                    <span className="col-span-2 text-foreground font-mono">{formatDate(doc.lastUpdated)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">File Type</span>
                    <span className="col-span-2 text-foreground uppercase font-mono">{doc.type}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Language</span>
                    <span className="col-span-2 text-foreground">{doc.language}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Pages</span>
                    <span className="col-span-2 text-foreground font-mono">{doc.pagesCount}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5">
                    <span className="text-muted-foreground font-medium">File Size</span>
                    <span className="col-span-2 text-foreground font-mono">{formatSize(doc.sizeBytes)}</span>
                  </div>
                </div>
              </div>

              {/* RAG Knowledge Information */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Knowledge Information
                </h4>
                <div className="border border-border/80 rounded-xl overflow-hidden text-xs bg-muted/10">
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Embedding Model</span>
                    <span className="col-span-2 text-foreground font-mono">{doc.embeddingModel}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Chunk Count</span>
                    <span className="col-span-2 text-foreground font-mono font-semibold">{doc.chunksCount} chunks</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Avg Chunk Size</span>
                    <span className="col-span-2 text-foreground font-mono">{doc.status === 'Indexed' ? `${doc.averageChunkSize} tokens` : '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Indexed At</span>
                    <span className="col-span-2 text-foreground font-mono">{formatDate(doc.lastIndexed)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Last Retrieved</span>
                    <span className="col-span-2 text-foreground font-mono">{formatDate(doc.lastRetrieved)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border/60 p-2.5">
                    <span className="text-muted-foreground font-medium">Retrieval Count</span>
                    <span className="col-span-2 text-foreground font-mono font-semibold">{doc.retrievalCount} hits</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5">
                    <span className="text-muted-foreground font-medium">Status</span>
                    <span className="col-span-2 text-foreground">
                      <StatusBadge status={doc.status} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="flex gap-2.5 pt-4 border-t border-border/60 select-none">
                <Button 
                  onClick={handleReindex} 
                  disabled={doc.status === 'Processing'}
                  variant="outline" 
                  className="flex-1 text-xs gap-1.5 h-9 font-semibold"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", doc.status === 'Processing' && "animate-spin")} />
                  Re-index
                </Button>
                <Button 
                  onClick={handleDelete}
                  variant="destructive" 
                  className="flex-1 text-xs gap-1.5 h-9 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-semibold"
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

          {/* Preview Tab specific mock content */}
          {detailTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 select-none">
                <span>Page 1 of {doc.pagesCount || 1}</span>
                <span>File Format: <strong className="uppercase font-mono">{doc.type}</strong></span>
              </div>

              {/* Dynamic Mock content depends on type */}
              {doc.type === 'pdf' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Page Thumbnails</p>
                  <div className="grid grid-cols-2 gap-3.5">
                    {Array.from({ length: Math.min(doc.pagesCount || 4, 4) }).map((_, pageIdx) => (
                      <div key={pageIdx} className="bg-background border border-border rounded-lg p-3 aspect-[3/4] flex flex-col justify-between shadow-2xs hover:border-primary/25 transition-all">
                        <div className="space-y-1.5">
                          <div className="h-2 w-3/4 bg-muted rounded" />
                          <div className="h-1.5 w-full bg-muted/60 rounded" />
                          <div className="h-1.5 w-full bg-muted/60 rounded" />
                          <div className="h-1.5 w-5/6 bg-muted/60 rounded" />
                          <div className="h-1.5 w-2/3 bg-muted/60 rounded" />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono text-right">Page {pageIdx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : doc.type === 'md' ? (
                <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs text-foreground/80 space-y-3 leading-relaxed animate-in fade-in duration-300">
                  <div className="text-primary font-bold"># {doc.name.replace('.md', '')}</div>
                  <div className="border-l-2 border-primary/30 pl-2 text-muted-foreground italic">
                    This document outlines engineering guidelines for indexing.
                  </div>
                  <div>## Architecture Pipeline</div>
                  <div>- **Ingestion**: Extract plain text files</div>
                  <div>- **Vectorisation**: Generate word chunks</div>
                  <div>- **Reranker**: Cohere v3 embeddings</div>
                  <div className="bg-muted p-2 rounded text-[11px] text-muted-foreground">
                    git clone retrieva-backend-server
                  </div>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-lg p-5 shadow-xs space-y-4 font-serif text-xs leading-relaxed text-foreground/80 animate-in fade-in duration-300">
                  <h3 className="font-sans font-bold text-center text-sm border-b border-border/50 pb-2 text-foreground">
                    {doc.name.replace(/\.[^/.]+$/, "")}
                  </h3>
                  <p className="indent-4">
                    This represents a proprietary preview mockup for <strong>{doc.name}</strong>. It showcases structural content extracted during document preprocessing.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac sapien non neque lacinia convallis eu et mi. Suspendisse pulvinar, velit ut elementum congue, erat sem ultrices risus, ac facilisis.
                  </p>
                  <p className="indent-4">
                    Aenean imperdiet dictum tellus, eget convallis magna eleifend eu. Ut at sem luctus, scelerisque ligula id, sodales sem. Curabitur vel vulputate nulla.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab showing Audit logs */}
          {detailTab === 'activity' && (
            <div className="space-y-4 select-none">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Audit Timeline
              </h4>
              
              <div className="relative pl-4 border-l border-border space-y-6 py-2 ml-1.5 animate-in fade-in duration-300">
                {doc.activityLog.map((log, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Circle dot timeline point */}
                    <div className="absolute -left-[22.5px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-background shadow-2xs" />
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground flex items-center justify-between">
                        <span>{log.action}</span>
                        <span className="font-mono text-[9px] text-muted-foreground font-normal">{formatDate(log.timestamp)}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        {log.description}
                      </p>
                      <p className="text-[9px] font-bold text-primary/80 font-mono">
                        By {log.user}
                      </p>
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

export default DocumentDrawer;
