import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { SSEEventType } from '@/types';

const USE_MOCK = true; // 백엔드 완성 후 false

type Listener = (data: unknown) => void;

export function useSSE() {
  const { auth } = useAuth();
  const [connected, setConnected] = useState(USE_MOCK);
  const listenersRef = useRef<Map<SSEEventType, Set<Listener>>>(new Map());

  useEffect(() => {
    if (!auth || USE_MOCK) return;

    const { storeId, tableId } = auth;
    const token = localStorage.getItem('token');
    const es = new EventSource(`/api/stores/${storeId}/tables/${tableId}/events/orders?token=${token}`);

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    const types: SSEEventType[] = ['ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'ORDER_DELETED', 'SESSION_COMPLETED'];
    types.forEach((t) => {
      es.addEventListener(t, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          listenersRef.current.get(t)?.forEach((fn) => fn(data));
        } catch { /* ignore */ }
      });
    });

    return () => { es.close(); setConnected(false); };
  }, [auth]);

  const subscribe = useCallback((event: SSEEventType, listener: Listener) => {
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event)!.add(listener);
    return () => { listenersRef.current.get(event)?.delete(listener); };
  }, []);

  return { connected, subscribe };
}
