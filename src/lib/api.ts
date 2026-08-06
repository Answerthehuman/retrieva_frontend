import axios from 'axios';
import { Product, Source } from '@/store/chatStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

/** A document as returned by the backend's `retrieval_complete` SSE event. */
export interface RetrievedDocument {
  id?: string;
  content?: string;
  source?: string;
  page?: number | string;
  document_summary?: string;
  score?: number;
  hybrid_score?: number;
  semantic_score?: number;
  bm25_score?: number;
  rerank_score?: number;
}

const KNOWN_FILE_TYPES: Source['fileType'][] = ['pdf', 'docx', 'txt', 'md', 'csv', 'xlsx', 'pptx'];

const fileTypeOf = (name: string): Source['fileType'] => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return (KNOWN_FILE_TYPES as string[]).includes(ext) ? (ext as Source['fileType']) : 'txt';
};

/**
 * Collapse whichever score the backend produced into a 0-100 figure.
 * Reranker output is an unbounded logit, so it gets squashed; hybrid and
 * cosine scores are already normalised to roughly 0-1.
 */
const relevanceOf = (doc: RetrievedDocument): number => {
  if (typeof doc.rerank_score === 'number') {
    return Math.round((1 / (1 + Math.exp(-doc.rerank_score))) * 100);
  }
  const raw = doc.hybrid_score ?? doc.score ?? 0;
  return Math.round(Math.min(Math.max(raw, 0), 1) * 100);
};

/** Map a backend document onto the Source shape the UI renders. */
export const toSource = (doc: RetrievedDocument, index: number): Source => {
  const rawPath = doc.source || 'Unknown source';
  const title = rawPath.split(/[\\/]/).pop() || rawPath;
  const page = Number(doc.page);

  return {
    id: String(doc.id ?? `src-${index}`),
    title,
    fileType: fileTypeOf(title),
    pageNumber: Number.isFinite(page) && page > 0 ? page : 1,
    relevanceScore: relevanceOf(doc),
    snippet: doc.content,
  };
};

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

export interface BackendChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: RetrievedDocument[] | null;
  created_at: string;
}

export interface HealthCheck {
  status: 'ok' | 'error' | 'unconfigured';
  detail?: string;
  [key: string]: unknown;
}

export interface HealthResponse {
  service: string;
  status: 'ok' | 'degraded';
  version: string;
  checks: {
    database: HealthCheck & { engine?: string };
    milvus: HealthCheck & { uri?: string; collections?: string[] };
    llm: HealthCheck & { provider?: string; model?: string };
  };
  config: {
    embedding_model: string;
    collection: string;
    hybrid_search: boolean;
    rerank_enabled: boolean;
    retrieval_top_k: number;
    rerank_top_k: number;
    chunk_size: number;
    chunk_overlap: number;
  };
}

export const systemApi = {
  /** Live backend status — powers the Settings panel and connection indicator. */
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health', { timeout: 10000 });
    return response.data;
  },
};

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

  /** Full persisted transcript for a session, including real sources per answer. */
  getMessages: async (sessionId: string): Promise<BackendChatMessage[]> => {
    const response = await api.get<BackendChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  sendMessageStream: async (
    message: string,
    sessionId: string,
    onEvent: (event: string, data: any) => void,
    options?: { collectionName?: string; filters?: string }
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        collection_name: options?.collectionName,
        filters: options?.filters,
      }),
    });

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        /* non-JSON error body */
      }
      throw new Error(detail);
    }

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
