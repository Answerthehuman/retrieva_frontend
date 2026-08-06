import axios from 'axios';
import { Product } from '@/store/chatStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

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

export interface SessionResponse {
  session_id: string;
  status: string;
}

export const chatApi = {
  createSession: async (email?: string, firstQuestion?: string): Promise<SessionResponse> => {
    const response = await api.post<SessionResponse>('/chat/sessions', {
      email,
      first_question: firstQuestion
    });
    return response.data;
  },

  sendMessage: async (message: string, sessionId: string, email?: string): Promise<ChatApiResponse> => {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
      message,
      email,
    });

    const streamText = response.data as string;
    let finalResponse = "";
    const products: Product[] = [];
    
    try {
      const lines = streamText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.format === 'generation_complete' || data.type === 'generation_complete') {
              if (finalResponse) {
                finalResponse += '\n\n';
              }
              finalResponse += data.content || "";
            } else if (data.type === 'item') {
              products.push({
                index_number: data.metadata?.index_number || 0,
                product_url: data.link || "",
                product_image_url: data.metadata?.image_url || "",
                brand: data.content || "",
                product_category: "",
                product_colour: "",
                occasions: "",
                stream: data.metadata?.stream || ""
              });
            }
          } catch (e) {}
        }
      }
    } catch (err) {}

    if (!finalResponse) {
      // If we don't have generation_complete, try to concatenate tokens
      const lines = streamText.split('\n');
      let tokens = "";
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text' || data.type === 'token') {
              tokens += data.content || "";
            }
          } catch (e) {}
        }
      }
      finalResponse = tokens || "Response received, but format was unexpected.";
    }

    // Merge duplicates by product_url and update stream source
    const mergedProducts: Product[] = [];
    const urlMap = new Map<string, Product>();

    for (const p of products) {
      if (urlMap.has(p.product_url)) {
        const existing = urlMap.get(p.product_url)!;
        if (existing.stream && p.stream && existing.stream !== p.stream) {
          existing.stream = 'both';
        }
      } else {
        const productCopy = { ...p };
        urlMap.set(p.product_url, productCopy);
        mergedProducts.push(productCopy);
      }
    }

    // Re-index sequentially from 1 to N
    mergedProducts.forEach((p, idx) => {
      p.index_number = idx + 1;
    });

    return {
      response: finalResponse,
      metadata: {
        products: mergedProducts,
        'inv-response': ''
      }
    };
  },

  sendMessageStream: async (
    message: string,
    sessionId: string,
    onEvent: (event: string, data: any) => void
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const rawData = JSON.parse(trimmed.slice(6));
            const eventType = rawData.type === 'event' ? rawData.format : (rawData.type || rawData.format);
            onEvent(eventType, rawData);
          } catch (e) {
            console.error('Error parsing SSE line:', trimmed, e);
          }
        }
      }
    }
  },
};

export interface IngestResponse {
  collection_name: string;
  file_name: string;
  inserted: number;
  document_summary: string;
}

export const knowledgeApi = {
  /**
   * Upload a file to the backend ingestion pipeline.
   * Sends a multipart/form-data POST to /ingest/upload.
   */
  uploadDocument: async (file: File, collectionName?: string): Promise<IngestResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (collectionName) {
      formData.append('collection_name', collectionName);
    }

    const response = await fetch(`${API_BASE_URL}/ingest/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = `Upload failed (${response.status})`;
      try {
        const errorBody = await response.json();
        errorDetail = errorBody.detail || errorDetail;
      } catch {
        // Response was not JSON — use status text
      }
      throw new Error(errorDetail);
    }

    return response.json();
  },
};
