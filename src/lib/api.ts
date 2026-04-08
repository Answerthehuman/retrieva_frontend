import axios from 'axios';
import { Product } from '@/store/chatStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nonrefractive-lisette-lithely.ngrok-free.dev';

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
  sendMessage: async (message: string, threadId: string): Promise<ChatApiResponse> => {
    const response = await api.post<ChatApiResponse>('/chat', {
      query: message,
      messages: [],
      thread_id: threadId,
    });
    return response.data;
  },
};
