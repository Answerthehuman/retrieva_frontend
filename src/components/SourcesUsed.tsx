import { File, FileText, FileSpreadsheet, Presentation, Plus } from 'lucide-react';
import { Source, useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

interface SourcesUsedProps {
  sources: Source[];
  onSourceClick?: (sourceId: string) => void;
}

export const SourcesUsed = ({ sources, onSourceClick }: SourcesUsedProps) => {
  const { setRightSidebarOpen, setRightSidebarTab, setActiveSourceId } = useChatStore();

  if (!sources || sources.length === 0) return null;

  const maxVisible = 3;
  const visibleSources = sources.slice(0, maxVisible);
  const remainingCount = sources.length - maxVisible;

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
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

  const handleCardClick = (source: Source) => {
    setActiveSourceId(source.id);
    setRightSidebarTab('sources');
    setRightSidebarOpen(true);
    if (onSourceClick) {
      onSourceClick(source.id);
    }
  };

  const handleMoreClick = () => {
    setActiveSourceId(null);
    setRightSidebarTab('sources');
    setRightSidebarOpen(true);
  };

  return (
    <div className="mt-4 pt-3 border-t border-border/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Sources Used
      </h4>
      <div className="flex flex-wrap gap-2.5">
        {visibleSources.map((source) => (
          <button
            key={source.id}
            onClick={() => handleCardClick(source)}
            className={cn(
              "flex flex-col items-start gap-1.5 p-2.5 rounded-lg border border-border bg-muted/40 text-left transition-all max-w-[200px] select-none cursor-pointer",
              "hover:border-primary/40 hover:bg-muted/80 hover:-translate-y-0.5 active:translate-y-0 shadow-2xs hover:shadow-sm"
            )}
          >
            <div className="flex items-center gap-2 w-full">
              {getFileIcon(source.fileType)}
              <span className="text-xs font-medium text-foreground truncate flex-1">
                {source.title}
              </span>
            </div>
            <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
              <span>Page {source.pageNumber}</span>
              {source.relevanceScore && (
                <span className="font-semibold text-primary/80">{source.relevanceScore}% match</span>
              )}
            </div>
          </button>
        ))}

        {remainingCount > 0 && (
          <button
            onClick={handleMoreClick}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-4 rounded-lg border border-dashed border-border bg-muted/20 text-center transition-all text-xs font-medium text-primary cursor-pointer select-none",
              "hover:border-primary/40 hover:bg-muted/50 hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            <Plus className="h-3 w-3" />
            <span>{remainingCount} more</span>
          </button>
        )}
      </div>
    </div>
  );
};
