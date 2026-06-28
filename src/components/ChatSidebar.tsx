import { PanelLeftClose, PanelLeft, Plus, Trash2, MessageSquare, Database, Settings as SettingsIcon, Folder } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useKnowledgeStore } from '@/store/knowledgeStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const isSettingsActive = currentPath.startsWith('/settings');

  const totalDocsCount = documents.length;

  return (
    <>
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 transition-colors hover:bg-muted"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 w-64 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Retrieva</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-muted">
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <Button 
            onClick={() => {
              createNewChat();
              if (!isChatActive) navigate('/');
            }} 
            className="w-full gap-2 shadow-sm font-semibold" 
            variant="default"
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>

        {/* Permanent Navigation Items */}
        <div className="px-2 space-y-1 mb-2">
          <button
            onClick={() => navigate('/')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-medium',
              isChatActive ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-accent/50 text-foreground/80'
            )}
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Chats</span>
          </button>

          <div className="space-y-1">
            <button
              onClick={() => {
                setCollectionFilter('all');
                navigate('/knowledge-base');
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all text-sm font-medium',
                isKbActive ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-accent/50 text-foreground/80'
              )}
            >
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-primary" />
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
            onClick={() => navigate('/settings')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-medium',
              isSettingsActive ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-accent/50 text-foreground/80'
            )}
          >
            <SettingsIcon className="h-4 w-4 text-primary" />
            <span>Settings</span>
          </button>
        </div>

        {/* Divider & Recent Chats Section */}
        {isChatActive && (
          <>
            <div className="px-4 py-2 border-t border-border mt-2 mb-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Chats
              </h3>
            </div>

            <ScrollArea className="flex-1 px-2">
              {chats.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">No chats yet</p>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div key={chat.id} className="group relative animate-in fade-in duration-300">
                      <button
                        onClick={() => selectChat(chat.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm pr-10',
                          'hover:bg-accent/50',
                          chat.id === currentChatId && 'bg-accent text-accent-foreground font-medium'
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all z-10 text-foreground/40 hover:text-destructive hover:bg-destructive/10"
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
      </aside>
    </>
  );
};
