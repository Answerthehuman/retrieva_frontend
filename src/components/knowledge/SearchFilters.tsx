import { useKnowledgeStore } from '@/store/knowledgeStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';

export const SearchFilters = () => {
  const {
    searchQuery,
    collectionFilter,
    typeFilter,
    statusFilter,
    ownerFilter,
    dateAddedFilter,
    collections,
    setSearchQuery,
    setCollectionFilter,
    setTypeFilter,
    setStatusFilter,
    setOwnerFilter,
    setDateAddedFilter
  } = useKnowledgeStore();

  const handleReset = () => {
    setSearchQuery('');
    setCollectionFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setOwnerFilter('all');
    setDateAddedFilter('all');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    collectionFilter !== 'all' || 
    typeFilter !== 'all' || 
    statusFilter !== 'all' || 
    ownerFilter !== 'all' || 
    dateAddedFilter !== 'all';

  return (
    <div className="bg-card border border-border p-3.5 rounded-xl shadow-2xs space-y-3.5 w-full select-none">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by filename..."
            className="pl-9 h-9 border-border text-xs focus-visible:ring-primary/25"
          />
        </div>

        {/* Collection Dropdown */}
        <Select value={collectionFilter} onValueChange={setCollectionFilter}>
          <SelectTrigger className="w-[150px] h-9 text-xs border-border bg-background">
            <SelectValue placeholder="Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Collections</SelectItem>
            {collections.map(c => (
              <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* File Type Dropdown */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs border-border bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Types</SelectItem>
            <SelectItem value="pdf" className="text-xs">PDF</SelectItem>
            <SelectItem value="docx" className="text-xs">DOCX</SelectItem>
            <SelectItem value="txt" className="text-xs">TXT</SelectItem>
            <SelectItem value="md" className="text-xs">MD</SelectItem>
            <SelectItem value="csv" className="text-xs">CSV</SelectItem>
            <SelectItem value="xlsx" className="text-xs">XLSX</SelectItem>
            <SelectItem value="pptx" className="text-xs">PPTX</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Dropdown */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs border-border bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            <SelectItem value="Indexed" className="text-xs">Indexed</SelectItem>
            <SelectItem value="Needs Re-index" className="text-xs">Needs Re-index</SelectItem>
            <SelectItem value="Processing" className="text-xs">Processing</SelectItem>
            <SelectItem value="Failed" className="text-xs">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Owner Dropdown */}
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs border-border bg-background">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Owners</SelectItem>
            <SelectItem value="John Doe" className="text-xs">John Doe</SelectItem>
            <SelectItem value="Jane Smith" className="text-xs">Jane Smith</SelectItem>
            <SelectItem value="Alice Brown" className="text-xs">Alice Brown</SelectItem>
            <SelectItem value="Bob Wilson" className="text-xs">Bob Wilson</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Dropdown */}
        <Select value={dateAddedFilter} onValueChange={setDateAddedFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs border-border bg-background">
            <SelectValue placeholder="Date Added" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Time</SelectItem>
            <SelectItem value="today" className="text-xs">Added Today</SelectItem>
            <SelectItem value="week" className="text-xs">Added This Week</SelectItem>
            <SelectItem value="month" className="text-xs">Added This Month</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset filters trigger */}
        {hasActiveFilters && (
          <Button 
            onClick={handleReset} 
            variant="ghost" 
            size="sm" 
            className="gap-1 h-9 text-xs hover:bg-muted text-muted-foreground hover:text-foreground font-semibold"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
