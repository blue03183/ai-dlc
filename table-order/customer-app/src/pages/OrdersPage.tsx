import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE } from '@/hooks/useSSE';
import { orderApi } from '@/api';
import type { Order, OrderStatus } from '@/types';

const STATUS_LABEL: Record<OrderStatus, string> = { PENDING: '대기중', PREPARING: '준비중', COMPLETED: '완료' };

function formatTime(s: string) {
  return new Date(s).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const { auth } = useAuth();
  const { subscribe, connected } = useSSE();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    orderApi.getByTable(auth.storeId, auth.tableId).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  // SSE 구독
  useEffect(() => {
    const u1 = subscribe('ORDER_STATUS_CHANGED', (d: unknown) => {
      const { orderId, status } = d as { orderId: number; status: OrderStatus };
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    });
    const u2 = subscribe('ORDER_DELETED', (d: unknown) => {
      const { orderId } = d as { orderId: number };
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    });
    const u3 = subscribe('SESSION_COMPLETED', () => setOrders([]));
    return () => { u1(); u2(); u3(); };
  }, [subscribe]);

  const refresh = useCallback(() => {
    if (!auth) return;
    orderApi.getByTable(auth.storeId, auth.tableId).then(setOrders).catch(() => {});
  }, [auth]);

  if (loading) return <div className="loading">주문 내역을 불러오는 중...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">주문 내역</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`sse-dot ${connected ? 'on' : 'off'}`} aria-label={connected ? '실시간 연결됨' : '연결 끊김'} />
          <button className="btn btn-sm btn-outline" onClick={refresh}>새로고침</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><p>주문 내역이 없습니다.</p></div>
      ) : (
        <div>
          {orders.map((o) => (
            <article key={o.id} className="order-card">
              <div className="order-card-header">
                <span className="order-card-number">{o.orderNumber}</span>
                <span className={`status-badge status-${o.status}`}>{STATUS_LABEL[o.status]}</span>
              </div>
              <div className="order-card-time">{formatTime(o.createdAt)}</div>
              <div className="order-card-items">
                {o.items.map((item, idx) => (
                  <div key={idx}>{item.menuName} × {item.quantity} ({item.subtotal.toLocaleString()}원)</div>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-card-total">{o.totalAmount.toLocaleString()}원</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
