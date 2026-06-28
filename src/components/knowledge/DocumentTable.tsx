import { useKnowledgeStore } from '@/store/knowledgeStore';
import { DocumentRow } from './DocumentRow';
import { EmptyState } from './EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DocumentTable = () => {
  const {
    selectedDocIds,
    selectAllDocs,
    clearSelection,
    getFilteredDocuments
  } = useKnowledgeStore();

  const filteredDocs = getFilteredDocuments();

  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      clearSelection();
    } else {
      selectAllDocs(filteredDocs.map(d => d.id));
    }
  };

  const isAllChecked = filteredDocs.length > 0 && selectedDocIds.length === filteredDocs.length;
  const isSomeChecked = selectedDocIds.length > 0 && selectedDocIds.length < filteredDocs.length;

  if (filteredDocs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-card border border-border/80 rounded-xl shadow-2xs overflow-hidden select-none animate-in fade-in duration-300">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-border/70">
            {/* Header Checkbox */}
            <TableHead className="w-12 text-center">
              <div 
                onClick={handleSelectAll}
                className={cn(
                  "h-4 w-4 mx-auto rounded border border-input flex items-center justify-center transition-all duration-200 cursor-pointer",
                  isAllChecked ? "bg-primary border-primary text-primary-foreground scale-105" : 
                  isSomeChecked ? "bg-primary/50 border-primary/70 text-primary-foreground" : 
                  "hover:border-foreground/45"
                )}
              >
                {isAllChecked && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </div>
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Document Name</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Collection</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground text-center">Chunks</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Last Updated</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Size</TableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
