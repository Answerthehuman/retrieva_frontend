import { DocumentItem, useKnowledgeStore } from '@/store/knowledgeStore';
import { StatusBadge } from './StatusBadge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, MoreVertical, File, FileText, FileSpreadsheet, Presentation, Trash2, RefreshCw, FolderInput } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DocumentRowProps {
  doc: DocumentItem;
}

export const DocumentRow = ({ doc }: DocumentRowProps) => {
  const {
    selectedDocIds,
    toggleDocSelection,
    setActiveDetailDocId,
    reindexDocuments,
    deleteDocuments,
    moveToCollection,
    collections
  } = useKnowledgeStore();

  const { toast } = useToast();

  const isChecked = selectedDocIds.includes(doc.id);

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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleRowClick = () => {
    setActiveDetailDocId(doc.id);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      className={cn(
        "group hover:bg-muted/15 cursor-pointer text-xs transition-all duration-200 select-none border-b border-border/60",
        isChecked && "bg-primary/[0.02]"
      )}
    >
      {/* Checkbox Column */}
      <TableCell
        className="w-12 text-center"
        onClick={(e) => {
          e.stopPropagation();
          toggleDocSelection(doc.id);
        }}
      >
        <div className={cn(
          "h-4 w-4 mx-auto rounded border border-input flex items-center justify-center transition-all duration-200",
          isChecked ? "bg-primary border-primary text-primary-foreground scale-105" : "group-hover:border-foreground/45"
        )}>
          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
      </TableCell>

      {/* Document Name Column */}
      <TableCell className="font-semibold text-foreground max-w-[260px] truncate">
        <div className="flex items-center gap-2.5 truncate">
          {getFileIcon(doc.type)}
          <span className="truncate group-hover:text-primary transition-colors" title={doc.name}>
            {doc.name}
          </span>
        </div>
      </TableCell>

      {/* Collection Column */}
      <TableCell className="text-muted-foreground font-medium">
        {doc.collection}
      </TableCell>

      {/* Type Column */}
      <TableCell className="uppercase text-muted-foreground font-mono text-[10px]">
        {doc.type}
      </TableCell>

      {/* Status Badge Column */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={doc.status} />
      </TableCell>

      {/* Chunks Column */}
      <TableCell className="text-center font-mono text-muted-foreground font-semibold">
        {doc.status === 'Indexed' ? doc.chunksCount : '-'}
      </TableCell>

      {/* Last Updated Column */}
      <TableCell className="text-muted-foreground font-mono text-[10px]">
        {new Date(doc.lastUpdated).toLocaleDateString()}
      </TableCell>

      {/* Size Column */}
      <TableCell className="text-muted-foreground font-mono text-[10px]">
        {formatSize(doc.sizeBytes)}
      </TableCell>

      {/* Action Menu Column */}
      <TableCell
        className="text-center w-12"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 mt-0.5">
            <DropdownMenuLabel className="text-[9px] uppercase text-muted-foreground">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => {
                reindexDocuments([doc.id]);
                toast({
                  title: "Re-indexing requested",
                  description: `Indexing job started for ${doc.name}.`
                });
              }}
              disabled={doc.status === 'Processing'}
              className="cursor-pointer text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Re-index</span>
            </DropdownMenuItem>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-sm cursor-pointer select-none">
                  <FolderInput className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 text-left">Move to</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left" className="w-40">
                {collections.map(col => (
                  <DropdownMenuItem
                    key={col.name}
                    onClick={() => {
                      moveToCollection([doc.id], col.name);
                      toast({
                        title: "Document moved",
                        description: `Moved ${doc.name} to collection ${col.name}`
                      });
                    }}
                    className="cursor-pointer text-xs"
                  >
                    {col.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
                  deleteDocuments([doc.id]);
                  toast({
                    title: "Document deleted",
                    description: `Removed index entry for ${doc.name}`
                  });
                }
              }}
              className="cursor-pointer text-xs text-destructive focus:text-destructive hover:bg-destructive/10 gap-1.5 font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default DocumentRow;
