import axios from 'axios';
import { Chat, Message, Product } from '@/store/chatStore';

// ✅ Set your backend URL here or in .env as VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatApiResponse {
  response: string;
  metadata: {
    products: Product[];
    'inv-response': string;
  };
}

export const chatApi = {
  // Get all chats
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get<Chat[]>('/chats');
    return response.data;
  },

  // Create a new chat
  createChat: async (): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>('/chats');
    return response.data;
  },

  // Get messages for a specific chat
  getChatMessages: async (chatId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/chats/${chatId}`);
    return response.data;
  },

  // Send a message to the /chat endpoint
  sendMessage: async (message: string): Promise<ChatApiResponse> => {
    const response = await api.post<ChatApiResponse>('/chat', { message });
    return response.data;
  },
};
