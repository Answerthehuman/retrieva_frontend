import { useKnowledgeStore } from '@/store/knowledgeStore';
import { useChatStore } from '@/store/chatStore';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ModeToggle } from '@/components/ModeToggle';

// Redeployed modular component sub-system
import { KnowledgeStats } from '@/components/knowledge/KnowledgeStats';
import { CollectionSidebar } from '@/components/knowledge/CollectionSidebar';
import { SearchFilters } from '@/components/knowledge/SearchFilters';
import { DocumentTable } from '@/components/knowledge/DocumentTable';
import { BulkActionToolbar } from '@/components/knowledge/BulkActionToolbar';
import { DocumentDrawer } from '@/components/knowledge/DocumentDrawer';
import { UploadModal } from '@/components/knowledge/UploadModal';
import { ConnectSourceModal } from '@/components/knowledge/ConnectSourceModal';
import { LoadingState } from '@/components/knowledge/LoadingState';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Upload,
  Link as LinkIcon,
  MoreVertical,
  Database,
  LogOut,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function KnowledgeBase() {
  const {
    isSidebarOpen,
    logout
  } = useChatStore();

  const {
    documents,
    pageState,
    setPageState,
    collectionFilter,
    setCollectionFilter
  } = useKnowledgeStore();

  const { toast } = useToast();

  // Modal open states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  // Trigger loading state for 1 second on mount for visual polish
  useEffect(() => {
    setPageState('loading');
    const timer = setTimeout(() => {
      setPageState('content');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleUploadClick = () => {
    setIsUploadOpen(true);
  };

  const handleConnectClick = () => {
    setIsConnectOpen(true);
  };

  const handleRetry = () => {
    setPageState('loading');
    setTimeout(() => {
      setPageState('content');
      toast({
        title: "Retry successful",
        description: "Re-fetched knowledge base details successfully."
      });
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Persistent global sidebar */}
      <ChatSidebar />

      {/* Main panel layout */}
      <main
        className="flex-1 transition-all duration-300 overflow-y-auto flex flex-col h-screen"
        style={{ marginLeft: isSidebarOpen ? '14rem' : '0' }}
      >
        {/* Top Header Bar */}
        <header className="px-5 py-3 border-b border-border flex items-center justify-between bg-card shrink-0 select-none">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Knowledge Base
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage the documents Retrieva searches when answering questions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Dynamic UI State Selector (Demo tool) — dev-only, never shipped
                to a production build. */}
            <div
              className={cn(
                'hidden border border-border/80 bg-muted/30 rounded-lg p-0.5 text-[10px] items-center mr-2',
                import.meta.env.DEV && 'sm:flex'
              )}
            >
              <span className="px-2 text-muted-foreground font-semibold uppercase tracking-wider">Demo States:</span>
              <button
                onClick={() => setPageState('content')}
                className={cn(
                  "px-2 py-1 rounded-md font-semibold transition-all",
                  pageState === 'content' ? "bg-background shadow-3xs text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Content
              </button>
              <button
                onClick={() => setPageState('loading')}
                className={cn(
                  "px-2 py-1 rounded-md font-semibold transition-all",
                  pageState === 'loading' ? "bg-background shadow-3xs text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Loading
              </button>
              <button
                onClick={() => setPageState('error')}
                className={cn(
                  "px-2 py-1 rounded-md font-semibold transition-all",
                  pageState === 'error' ? "bg-background shadow-3xs text-destructive" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Error
              </button>
            </div>

            <Button onClick={handleUploadClick} size="sm" className="gap-1.5 h-9 font-semibold text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/95">
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 h-9 font-semibold text-xs px-3">
                  <LinkIcon className="h-3.5 w-3.5" /> Connect Source
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1 z-30">
                <DropdownMenuLabel className="text-[9px] uppercase text-muted-foreground">Select Source</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['Google Drive', 'Notion', 'SharePoint', 'Confluence', 'Dropbox', 'Local Folder'].map(sourceName => (
                  <DropdownMenuItem
                    key={sourceName}
                    onClick={() => {
                      if (sourceName === 'Google Drive' || sourceName === 'Notion' || sourceName === 'SharePoint' || sourceName === 'Confluence' || sourceName === 'Dropbox' || sourceName === 'Local Folder') {
                        setIsConnectOpen(true);
                      }
                    }}
                    className="cursor-pointer text-xs font-medium"
                  >
                    {sourceName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-muted border border-border">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1 z-30">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-xs">Manage Connectors</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs">Vector DB Indexes</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs">Chunking Strategy</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-border shadow-sm hover:scale-105 transition-transform ml-1">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 mt-2 z-30" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground pt-1">john.doe@retrieva.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-xs">Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-destructive font-semibold"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
          </div>
        </header>

        {/* Dynamic page state content renderer */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {pageState === 'loading' && <LoadingState />}

          {pageState === 'error' && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-destructive/20 rounded-2xl max-w-lg mx-auto space-y-5 shadow-2xs select-none animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-destructive/15 rounded-full text-destructive shadow-sm">
                <AlertOctagon className="h-9 w-9" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-foreground text-sm">Failed to load Knowledge Base</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  We encountered an unexpected database connection timeout while fetching indexed files. Please retry.
                </p>
              </div>
              <Button onClick={handleRetry} size="sm" className="gap-1.5 h-9 font-semibold text-xs px-4">
                <RefreshCw className="h-3.5 w-3.5" /> Retry Connection
              </Button>
            </div>
          )}

          {pageState === 'content' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* The backend exposes ingestion (POST /ingest/upload) but no
                  document listing/CRUD API, so everything below except upload
                  is local sample data. Saying so beats implying it is live. */}
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertOctagon className="h-4 w-4 shrink-0 mt-px" aria-hidden="true" />
                <p className="leading-relaxed">
                  <strong className="font-semibold">Sample data.</strong> Uploads are ingested into
                  the real backend, but this table, its counts and its actions are local placeholders —
                  the backend has no document-listing API yet, so nothing here is fetched or persisted
                  server-side.
                </p>
              </div>

              {/* Analytics metrics */}
              <KnowledgeStats />

              {/* Layout split pane */}
              <div className="flex gap-6 items-start h-[calc(100vh-270px)]">
                {/* Gmail-style collection sidebar menu */}
                <CollectionSidebar />

                {/* Search, Filters, and Table viewport */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
                  {collectionFilter !== 'all' && (
                    <div className="bg-primary/[0.04] border border-primary/20 rounded-xl p-3 flex items-center justify-between text-xs text-primary font-medium animate-in slide-in-from-top duration-200 select-none">
                      <div className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 shrink-0" />
                        <span>Viewing Context: <strong>{collectionFilter}</strong> ({documents.filter(d => d.collection === collectionFilter).length} files)</span>
                      </div>
                      <button
                        onClick={() => setCollectionFilter('all')}
                        className="text-[10px] font-bold text-primary hover:underline hover:bg-primary/5 px-2 py-0.5 rounded"
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}

                  <SearchFilters />

                  <div className="flex-1 overflow-y-auto pr-1">
                    <DocumentTable />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Toolbar when checked */}
        <BulkActionToolbar />

        {/* Side slide drawer details panel */}
        <DocumentDrawer />

        {/* File Queue Upload Modal */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />

        {/* External Connectors Modal */}
        <ConnectSourceModal
          isOpen={isConnectOpen}
          onClose={() => setIsConnectOpen(false)}
        />
      </main>
    </div>
  );
}
