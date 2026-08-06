import { create } from 'zustand';

export interface Product {
  index_number: number;
  product_url: string;
  product_image_url: string;
  brand: string;
  product_category: string;
  product_colour: string;
  occasions: string;
  stream?: string;
}

export interface Source {
  id: string;
  title: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'xlsx' | 'pptx';
  pageNumber: number;
  relevanceScore: number;
  snippet?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: Product[];
  sources?: Source[];
}

export interface Chat {
  id: string;
  title: string;
  sessionId: string | null;
  messages: Message[];
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  nextThreadNumber: number;
  isLoading: boolean;
  statusText: string;
  isSidebarOpen: boolean;
  isAuthenticated: boolean;
  user: { username: string } | null;
  
  // New sliding sidebar and active context selector states
  isRightSidebarOpen: boolean;
  rightSidebarTab: 'sources' | 'chunks' | 'details';
  activeSourceId: string | null;
  activeContextCollections: string[];

  createNewChat: () => string;
  selectChat: (id: string) => void;
  addMessageToCurrentChat: (message: Message) => void;
  updateChatTitle: (id: string, title: string) => void;
  updateChatSession: (id: string, sessionId: string) => void;
  deleteChat: (id: string) => void;
  getCurrentChat: () => Chat | undefined;
  /** One-shot prefill for the composer, set by homepage action cards. */
  draftInput: string;
  setDraftInput: (text: string) => void;
  setIsLoading: (loading: boolean) => void;
  setStatusText: (text: string) => void;
  updateLastMessageInCurrentChat: (updater: (message: Message) => Message) => void;
  toggleSidebar: () => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // New action functions
  setRightSidebarOpen: (open: boolean) => void;
  setRightSidebarTab: (tab: 'sources' | 'chunks' | 'details') => void;
  setActiveSourceId: (id: string | null) => void;
  setActiveContextCollections: (collections: string[]) => void;
  toggleActiveContextCollection: (collection: string) => void;
}

const STORAGE_KEY = 'chat-auth-state';
const CHATS_STORAGE_KEY = 'chat-history-state';

export const useChatStore = create<ChatState>((set, get) => {
  // Load initial auth state from localStorage
  const savedAuth = localStorage.getItem(STORAGE_KEY);
  const initialAuth = savedAuth ? JSON.parse(savedAuth) : { isAuthenticated: false, user: null };

  // Load initial chat history from localStorage
  const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);
  const initialChatsState = savedChats ? JSON.parse(savedChats) : { chats: [], currentChatId: null };

  return {
    chats: initialChatsState.chats || [],
    currentChatId: initialChatsState.currentChatId || null,
    nextThreadNumber: 1,
    isLoading: false,
    statusText: '',
    draftInput: '',
    isSidebarOpen: true,
    isRightSidebarOpen: false,
    rightSidebarTab: 'sources',
    activeSourceId: null,
    activeContextCollections: ['Marketing', 'Engineering', 'HR'],
    ...initialAuth,


    createNewChat: () => {
      const { chats } = get();
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        sessionId: null, // Will be set on first message
        messages: [],
      };
      const updatedChats = [newChat, ...chats];
      set({
        chats: updatedChats,
        currentChatId: newChat.id,
      });
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: updatedChats, currentChatId: newChat.id }));
      return newChat.id;
    },

    selectChat: (id) => {
      set({ currentChatId: id });
      const { chats } = get();
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats, currentChatId: id }));
    },

    deleteChat: (id) => {
      const { chats, currentChatId } = get();
      const updatedChats = chats.filter((chat) => chat.id !== id);
      const nextId = currentChatId === id ? (updatedChats.length > 0 ? updatedChats[0].id : null) : currentChatId;
      set({
        chats: updatedChats,
        currentChatId: nextId,
      });
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: updatedChats, currentChatId: nextId }));
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
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: updated, currentChatId }));
    },

    updateChatTitle: (id, title) => {
      const { currentChatId } = get();
      const updated = get().chats.map((c) => (c.id === id ? { ...c, title } : c));
      set({
        chats: updated,
      });
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: updated, currentChatId }));
    },
    
    updateChatSession: (id, sessionId) => {
      const { currentChatId } = get();
      const updated = get().chats.map((c) => (c.id === id ? { ...c, sessionId } : c));
      set({
        chats: updated,
      });
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: updated, currentChatId }));
    },

    getCurrentChat: () => {
      const { chats, currentChatId } = get();
      return chats.find((c) => c.id === currentChatId);
    },

    setDraftInput: (text) => set({ draftInput: text }),

    setIsLoading: (loading) => set({ isLoading: loading }),
    setStatusText: (text) => set({ statusText: text }),
    updateLastMessageInCurrentChat: (updater) => {
      const { chats, currentChatId } = get();
      if (!currentChatId) return;
      const updated = chats.map((chat) => {
        if (chat.id !== currentChatId) return chat;
        if (chat.messages.length === 0) return chat;
        const newMessages = [...chat.messages];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = updater(newMessages[lastIndex]);
        return { ...chat, messages: newMessages };
      });
      set({ chats: updated });
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify({ chats: updated, currentChatId }));
    },
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

    setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
    setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
    setActiveSourceId: (id) => set({ activeSourceId: id }),
    setActiveContextCollections: (collections) => set({ activeContextCollections: collections }),
    toggleActiveContextCollection: (collection) => set((state) => {
      const next = [...state.activeContextCollections];
      const idx = next.indexOf(collection);
      if (idx > -1) {
        next.splice(idx, 1);
      } else {
        next.push(collection);
      }
      return { activeContextCollections: next };
    }),
  };
});


