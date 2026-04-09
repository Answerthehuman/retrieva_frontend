import { create } from 'zustand';

export interface Product {
  index_number: number;
  product_url: string;
  product_image_url: string;
  brand: string;
  product_category: string;
  product_colour: string;
  occasions: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: Product[];
}

export interface Chat {
  id: string;
  title: string;
  threadId: string;
  messages: Message[];
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  nextThreadNumber: number;
  isLoading: boolean;
  isSidebarOpen: boolean;
  isAuthenticated: boolean;
  user: { username: string } | null;

  createNewChat: () => string;
  selectChat: (id: string) => void;
  addMessageToCurrentChat: (message: Message) => void;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  getCurrentChat: () => Chat | undefined;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = 'chat-auth-state';

export const useChatStore = create<ChatState>((set, get) => {
  // Load initial auth state from localStorage
  const savedAuth = localStorage.getItem(STORAGE_KEY);
  const initialAuth = savedAuth ? JSON.parse(savedAuth) : { isAuthenticated: false, user: null };

  return {
    chats: [],
    currentChatId: null,
    nextThreadNumber: 1,
    isLoading: false,
    isSidebarOpen: true,
    ...initialAuth,

    createNewChat: () => {
      const { nextThreadNumber, chats } = get();
      const threadId = `test${nextThreadNumber}`;
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        threadId,
        messages: [],
      };
      set({
        chats: [newChat, ...chats],
        currentChatId: newChat.id,
        nextThreadNumber: nextThreadNumber + 1,
      });
      return newChat.id;
    },

    selectChat: (id) => set({ currentChatId: id }),

    deleteChat: (id) => {
      const { chats, currentChatId } = get();
      const updatedChats = chats.filter((chat) => chat.id !== id);
      set({
        chats: updatedChats,
        currentChatId: currentChatId === id ? (updatedChats.length > 0 ? updatedChats[0].id : null) : currentChatId,
      });
    },

    addMessageToCurrentChat: (message) => {
      const { chats, currentChatId } = get();
      if (!currentChatId) return;
      const updated = chats.map((chat) => {
        if (chat.id !== currentChatId) return chat;
        const newMessages = [...chat.messages, message];
        // Auto-title on first user message
        const title =
          chat.messages.length === 0 && message.role === 'user'
            ? message.content.slice(0, 40) + (message.content.length > 40 ? '…' : '')
            : chat.title;
        return { ...chat, messages: newMessages, title };
      });
      set({ chats: updated });
    },

    updateChatTitle: (id, title) => {
      set({
        chats: get().chats.map((c) => (c.id === id ? { ...c, title } : c)),
      });
    },

    getCurrentChat: () => {
      const { chats, currentChatId } = get();
      return chats.find((c) => c.id === currentChatId);
    },

    setIsLoading: (loading) => set({ isLoading: loading }),
    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

    login: (username, password) => {
      // Dummy credentials check
      if (username === 'admin' && password === 'password') {
        const authData = { isAuthenticated: true, user: { username } };
        set(authData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
        return true;
      }
      return false;
    },

    logout: () => {
      const authData = { isAuthenticated: false, user: null };
      set(authData);
      localStorage.removeItem(STORAGE_KEY);
    },
  };
});


