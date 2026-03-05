import { useEffect, useRef, useCallback } from 'react';
import type { SSEEvent } from '@/types';

interface UseSSEOptions {
  storeId: number | null;
  token: string | null;
  onEvent: (event: SSEEvent) => void;
}

export function useSSE({ storeId, token, onEvent }: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!storeId || !token) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Vite proxy를 통해 /api 경로 사용
    const url = `/api/stores/${storeId}/events/orders?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const parsed: SSEEvent = JSON.parse(event.data);
        onEventRef.current(parsed);
      } catch {
        // 파싱 실패 무시
      }
    };

    es.onerror = () => {
      es.close();
      setTimeout(connect, 3000);
    };
  }, [storeId, token]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);
}
