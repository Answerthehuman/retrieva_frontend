import { useEffect } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { ChatSearchBar } from './ChatSearchBar';
import { ChatListItem } from './ChatListItem';
import { Button } from './ui/button';
import { chatApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const ChatSidebar = () => {
  const {
    chats,
    currentChatId,
    isSidebarOpen,
    searchQuery,
    toggleSidebar,
    setChats,
    setCurrentChatId,
    setMessages,
    reset,
  } = useChatStore();
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await chatApi.getChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  const handleNewChat = async () => {
    try {
      const { id } = await chatApi.createChat();
      const newChat = { id, title: 'New Chat' };
      setChats([newChat, ...chats]);
      setCurrentChatId(id);
      reset();
      toast({
        title: 'Success',
        description: 'New chat created',
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      });
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      setCurrentChatId(chatId);
      const messages = await chatApi.getChatMessages(chatId);
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive',
      });
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Toggle button when sidebar is closed */}
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

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Chats</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and New Chat */}
        <div className="p-4 space-y-3">
          <ChatSearchBar />
          <Button onClick={handleNewChat} className="w-full" variant="default">
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2">
          {filteredChats.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === currentChatId}
                  onSelect={() => handleSelectChat(chat.id)}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
