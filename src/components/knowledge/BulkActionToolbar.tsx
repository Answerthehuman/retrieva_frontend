import { useKnowledgeStore } from '@/store/knowledgeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FolderInput, 
  RefreshCw, 
  Trash2, 
  Download, 
  X, 
  CheckSquare, 
  MinusSquare 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const BulkActionToolbar = () => {
  const {
    selectedDocIds,
    collections,
    documents,
    getFilteredDocuments,
    selectAllDocs,
    clearSelection,
    reindexDocuments,
    deleteDocuments,
    moveToCollection
  } = useKnowledgeStore();

  const { toast } = useToast();
  const filteredDocs = getFilteredDocuments();

  if (selectedDocIds.length === 0) return null;

  const handleSelectAll = () => {
    selectAllDocs(filteredDocs.map(d => d.id));
  };

  const handleReindex = () => {
    reindexDocuments(selectedDocIds);
    toast({
      title: "Re-indexing batch started",
      description: `Triggered background indexing for ${selectedDocIds.length} document(s).`
    });
    clearSelection();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedDocIds.length} selected document(s)?`)) {
      deleteDocuments(selectedDocIds);
      toast({
        title: "Batch delete successful",
        description: `Removed ${selectedDocIds.length} document(s) from Retrieva catalog.`
      });
      clearSelection();
    }
  };

  const handleDownload = () => {
    toast({
      title: "Downloading archive",
      description: `Starting batch download for ${selectedDocIds.length} document(s).`
    });
  };

  const isAllChecked = selectedDocIds.length === filteredDocs.length;

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/95 border border-border shadow-2xl px-5 py-3 rounded-full z-45",
        "flex items-center gap-4 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-6 duration-300",
        "ring-1 ring-primary/10"
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium border-r border-border pr-4 mr-1">
        <CheckSquare className="h-4 w-4 text-primary shrink-0" />
        <span className="font-bold font-mono text-primary text-sm">{selectedDocIds.length}</span>
        <span className="text-muted-foreground">selected</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Select All / Toggle Selection */}
        {!isAllChecked ? (
          <Button
            onClick={handleSelectAll}
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 px-2.5 font-semibold text-foreground/80 hover:bg-muted"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Select All</span>
          </Button>
        ) : (
          <Button
            onClick={clearSelection}
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 px-2.5 font-semibold text-foreground/80 hover:bg-muted"
          >
            <MinusSquare className="h-3.5 w-3.5" />
            <span>Deselect All</span>
          </Button>
        )}

        {/* Move to Collection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 px-2.5 font-semibold text-foreground/80 hover:bg-muted"
            >
              <FolderInput className="h-3.5 w-3.5" />
              <span>Move</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44 mt-1.5 z-50">
            <DropdownMenuLabel className="text-[9px] uppercase text-muted-foreground">Move context to:</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {collections.map(col => (
              <DropdownMenuItem
                key={col.name}
                onClick={() => {
                  moveToCollection(selectedDocIds, col.name);
                  clearSelection();
                  toast({
                    title: "Documents moved",
                    description: `Successfully moved selected files to ${col.name} collection.`
                  });
                }}
                className="cursor-pointer text-xs"
              >
                {col.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Re-index */}
        <Button
          onClick={handleReindex}
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 px-2.5 font-semibold text-foreground/80 hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Re-index</span>
        </Button>

        {/* Download */}
        <Button
          onClick={handleDownload}
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 px-2.5 font-semibold text-foreground/80 hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </Button>

        {/* Delete */}
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 px-2.5 font-semibold text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </Button>

        {/* Cancel/Clear */}
        <button
          onClick={clearSelection}
          className="ml-2 hover:bg-muted p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
