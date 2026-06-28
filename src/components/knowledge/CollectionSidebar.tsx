import { useKnowledgeStore } from '@/store/knowledgeStore';
import { cn } from '@/lib/utils';
import { Database, Folder, Plus, FileText } from 'lucide-react';

export const CollectionSidebar = () => {
  const {
    collections,
    documents,
    collectionFilter,
    setCollectionFilter,
    addCollection
  } = useKnowledgeStore();

  const totalDocsCount = documents.length;

  const handleAddNewCollection = () => {
    const name = prompt('Enter a name for the new collection:');
    if (name && name.trim()) {
      addCollection(name.trim());
    }
  };

  return (
    <div className="w-56 shrink-0 border-r border-border h-full flex flex-col bg-card/45 select-none p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Folder className="h-3.5 w-3.5 text-primary" />
          Collections
        </h3>
      </div>

      <div className="flex-1 space-y-0.5">
        {/* All Documents filter */}
        <button
          onClick={() => setCollectionFilter('all')}
          className={cn(
            "w-full flex items-center justify-between py-2 px-2.5 text-xs rounded-lg transition-all text-left font-medium",
            collectionFilter === 'all'
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Database className="h-3.5 w-3.5 opacity-70 shrink-0" />
            <span className="truncate">All Documents</span>
          </div>
          <span className={cn(
            "px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono",
            collectionFilter === 'all' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {totalDocsCount}
          </span>
        </button>

        {/* Collection items */}
        {collections.map((col) => {
          const isActive = collectionFilter === col.name;
          return (
            <button
              key={col.name}
              onClick={() => setCollectionFilter(col.name)}
              className={cn(
                "w-full flex items-center justify-between py-2 px-2.5 text-xs rounded-lg transition-all text-left font-medium",
                isActive
                  ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2"
                  : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="h-3.5 w-3.5 opacity-70 shrink-0 text-muted-foreground" />
                <span className="truncate">{col.name}</span>
              </div>
              <span className={cn(
                "px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono",
                isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {col.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add collection button */}
      <button
        onClick={handleAddNewCollection}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-border hover:border-primary/50 text-xs font-semibold rounded-lg text-primary hover:bg-primary/5 hover:text-primary transition-all text-center"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New Collection</span>
      </button>
    </div>
  );
};

export default CollectionSidebar;
