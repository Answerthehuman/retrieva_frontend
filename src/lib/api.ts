import axios from 'axios';
import { Chat, Message } from '@/store/chatStore';

// Configure your API base URL here
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  // Send a message to a chat
  sendMessage: async (
    chatId: string,
    message: string
  ): Promise<{ assistant_response: string }> => {
    const response = await api.post<{ assistant_response: string }>(
      `/chats/${chatId}/messages`,
      { message }
    );
    return response.data;
  },
};
