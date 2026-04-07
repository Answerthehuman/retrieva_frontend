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
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  searchQuery: string;
  
  setChats: (chats: Chat[]) => void;
  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  isLoading: false,
  isSidebarOpen: true,
  searchQuery: '',
  
  setChats: (chats) => set({ chats }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () => set({ currentChatId: null, messages: [] }),
}));
