import { PanelLeftClose, PanelLeft, Plus, Trash2, MessageSquare, Database, Settings as SettingsIcon, Folder, Sparkles, Plug } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useKnowledgeStore } from '@/store/knowledgeStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useLocation, useNavigate } from 'react-router-dom';

// Placeholder plan usage — no billing/usage API exists yet.
const QUERIES_USED = 1240;
const QUERY_LIMIT = 2000;

export const ChatSidebar = () => {
  const {
    chats,
    currentChatId,
    isSidebarOpen,
    toggleSidebar,
    createNewChat,
    selectChat,
    deleteChat,
  } = useChatStore();

  const {
    collections,
    documents,
    collectionFilter,
    setCollectionFilter,
    addCollection,
  } = useKnowledgeStore();

  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isChatActive = currentPath === '/' || currentPath === '';
  const isKbActive = currentPath.startsWith('/knowledge-base');
  const isConnectorsActive = currentPath.startsWith('/connectors');
  const isSettingsActive = currentPath.startsWith('/settings');

  const totalDocsCount = documents.length;

  return (
    <>
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          className="fixed top-3 left-3 z-50 transition-colors hover:bg-muted"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 w-56 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-3.5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-secondary text-primary-foreground text-[13px] font-bold shadow-[0_2px_8px_-2px_rgba(37,99,235,0.5)]"
            >
              R
            </span>
            <h2 className="font-semibold text-foreground text-[15px] tracking-tight">Retrieva</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="h-8 w-8 text-muted-foreground hover:bg-primary/[0.07] hover:text-primary transition-colors duration-200"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </Button>
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={() => {
              createNewChat();
              if (!isChatActive) navigate('/');
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-[14px] px-4 py-2.5',
              'bg-gradient-to-br from-primary to-primary-secondary text-primary-foreground',
              'text-sm font-semibold shadow-[0_4px_14px_-4px_rgba(37,99,235,0.55)]',
              'transition-all duration-200 ease-out hover:shadow-[0_6px_18px_-4px_rgba(37,99,235,0.7)] hover:brightness-[1.04]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <Plus className="h-[18px] w-[18px]" /> New Chat
          </button>
        </div>

        {/* Permanent Navigation Items */}
        <div className="px-2.5 space-y-1 mb-2">
          <button
            onClick={() => navigate('/')}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm',
              isChatActive
                ? 'bg-primary/[0.08] text-primary font-semibold'
                : 'text-foreground/75 font-medium hover:bg-primary/[0.05] hover:text-foreground'
            )}
          >
            <MessageSquare className={cn('h-[18px] w-[18px]', isChatActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={1.9} />
            <span>Chats</span>
          </button>

          <div className="space-y-1">
            <button
              onClick={() => {
                setCollectionFilter('all');
                navigate('/knowledge-base');
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm',
                isKbActive
                  ? 'bg-primary/[0.08] text-primary font-semibold'
                  : 'text-foreground/75 font-medium hover:bg-primary/[0.05] hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Database className={cn('h-[18px] w-[18px]', isKbActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={1.9} />
                <span>Knowledge Base</span>
              </div>
            </button>

            {/* Collections nested submenu (expanded when knowledge base is active) */}
            {isKbActive && (
              <div className="pl-6 pr-2 py-1 space-y-0.5 border-l border-border ml-5 mt-1 animate-in fade-in duration-200">
                <button
                  onClick={() => setCollectionFilter('all')}
                  className={cn(
                    'w-full flex items-center justify-between py-1 px-2 text-xs rounded transition-all text-left',
                    collectionFilter === 'all'
                      ? 'font-semibold text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                  )}
                >
                  <span className="truncate">All Documents</span>
                  <span className="bg-muted px-1.5 py-0.2 rounded text-[10px] text-muted-foreground font-mono">
                    {totalDocsCount}
                  </span>
                </button>
                {collections.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setCollectionFilter(col.name)}
                    className={cn(
                      'w-full flex items-center justify-between py-1 px-2 text-xs rounded transition-all text-left',
                      collectionFilter === col.name
                        ? 'font-semibold text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Folder className="h-3 w-3 opacity-60" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="bg-muted px-1.5 py-0.2 rounded text-[10px] text-muted-foreground font-mono">
                      {col.count}
                    </span>
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    const name = prompt('Enter new collection name:');
                    if (name && name.trim()) {
                      addCollection(name.trim());
                    }
                  }}
                  className="w-full flex items-center gap-1.5 py-1 px-2 text-xs text-primary hover:text-primary/80 transition-all text-left font-medium"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Collection</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/connectors')}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm',
              isConnectorsActive
                ? 'bg-primary/[0.08] text-primary font-semibold'
                : 'text-foreground/75 font-medium hover:bg-primary/[0.05] hover:text-foreground'
            )}
          >
            <Plug className={cn('h-[18px] w-[18px]', isConnectorsActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={1.9} />
            <span>Connectors</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm',
              isSettingsActive
                ? 'bg-primary/[0.08] text-primary font-semibold'
                : 'text-foreground/75 font-medium hover:bg-primary/[0.05] hover:text-foreground'
            )}
          >
            <SettingsIcon className={cn('h-[18px] w-[18px]', isSettingsActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={1.9} />
            <span>Settings</span>
          </button>
        </div>

        {/* Divider & Recent Chats Section */}
        {isChatActive && (
          <>
            <div className="px-4 pt-3 pb-2 mt-1 border-t border-border">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Chats
              </h3>
            </div>

            <ScrollArea className="flex-1 px-2.5">
              {chats.length === 0 ? (
                <p className="px-2 py-2 text-[13px] leading-relaxed text-muted-foreground">
                  Start a new conversation or choose one of the quick actions above to begin
                  exploring your knowledge base.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {chats.map((chat) => (
                    <div key={chat.id} className="group relative animate-in fade-in duration-300">
                      <button
                        onClick={() => selectChat(chat.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-[13px] pr-9',
                          'transition-all duration-200',
                          chat.id === currentChatId
                            ? 'bg-primary/[0.08] text-primary font-semibold'
                            : 'text-foreground/70 hover:bg-primary/[0.05] hover:text-foreground'
                        )}
                      >
                        <span className="flex-1 truncate">{chat.title}</span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        aria-label={`Delete chat "${chat.title}"`}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all z-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}

        {/* Footer — plan usage */}
        <div className="mt-auto p-3">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/[0.05] to-primary-accent/[0.07] p-3.5 shadow-[0_2px_10px_-4px_rgba(37,99,235,0.18)]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-foreground">Retrieva Pro</span>
            </div>

            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              {QUERIES_USED} of {QUERY_LIMIT} queries used
            </p>

            <div
              role="progressbar"
              aria-valuenow={QUERIES_USED}
              aria-valuemin={0}
              aria-valuemax={QUERY_LIMIT}
              aria-label="Monthly query usage"
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-secondary transition-all duration-300"
                style={{ width: `${(QUERIES_USED / QUERY_LIMIT) * 100}%` }}
              />
            </div>

            <button
              type="button"
              className={cn(
                'mt-3 w-full rounded-lg bg-card px-3 py-2 text-[12px] font-semibold text-primary',
                'border border-primary/25 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
                'transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.04]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              )}
            >
              Upgrade plan
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
