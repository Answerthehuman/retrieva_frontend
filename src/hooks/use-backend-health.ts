import { useCallback, useEffect, useState } from 'react';
import { systemApi, type HealthResponse } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';

export type BackendStatus = 'checking' | 'ok' | 'degraded' | 'unreachable';

interface UseBackendHealth {
  status: BackendStatus;
  health: HealthResponse | null;
  error: string | null;
  refresh: () => void;
}

/**
 * Polls the backend's /health endpoint and mirrors the Milvus collection list
 * into the chat store, so the context picker offers collections that actually
 * exist rather than hard-coded names.
 */
export function useBackendHealth(pollMs = 30000): UseBackendHealth {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const setAvailableCollections = useChatStore((s) => s.setAvailableCollections);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const data = await systemApi.getHealth();
        if (cancelled) return;
        setHealth(data);
        setStatus(data.status === 'ok' ? 'ok' : 'degraded');
        setError(null);
        setAvailableCollections(data.checks?.milvus?.collections ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setHealth(null);
        setStatus('unreachable');
        setError(e?.message || 'Backend unreachable');
        setAvailableCollections([]);
      }
    };

    check();
    const id = window.setInterval(check, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs, nonce, setAvailableCollections]);

  return { status, health, error, refresh };
}
