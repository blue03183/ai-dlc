import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { SSEEventType } from '@/types';

type Listener = (data: unknown) => void;

export function useSSE() {
  const { auth } = useAuth();
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Map<SSEEventType, Set<Listener>>>(new Map());

  useEffect(() => {
    if (!auth) return;

    const { storeId, tableId } = auth;
    const es = new EventSource(
      `/api/stores/${storeId}/tables/${tableId}/events/orders`,
    );

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    // NestJS @Sse는 기본 'message' 이벤트로 전송
    // data: JSON.stringify({ type: 'ORDER_STATUS_CHANGED', ...payload })
    es.onmessage = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        const eventType = parsed.type as SSEEventType | undefined;
        if (eventType) {
          const payload = { ...parsed };
          delete payload.type;
          listenersRef.current.get(eventType)?.forEach((fn) => fn(payload));
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [auth]);

  const subscribe = useCallback(
    (eventType: SSEEventType, listener: Listener) => {
      if (!listenersRef.current.has(eventType)) {
        listenersRef.current.set(eventType, new Set());
      }
      listenersRef.current.get(eventType)!.add(listener);
      return () => {
        listenersRef.current.get(eventType)?.delete(listener);
      };
    },
    [],
  );

  return { connected, subscribe };
}
