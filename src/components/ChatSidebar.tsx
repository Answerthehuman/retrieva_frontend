import { PanelLeftClose, PanelLeft, Plus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

export const ChatSidebar = () => {
  const {
    chats,
    currentChatId,
    isSidebarOpen,
    toggleSidebar,
    createNewChat,
    selectChat,
  } = useChatStore();

  return (
    <>
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50"
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
          <h2 className="font-semibold text-foreground">Chats</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <Button onClick={() => createNewChat()} className="w-full gap-2" variant="default">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {chats.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">No chats yet</p>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                    'hover:bg-accent/50',
                    chat.id === currentChatId && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className="flex-1 truncate">{chat.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{chat.threadId}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
};
