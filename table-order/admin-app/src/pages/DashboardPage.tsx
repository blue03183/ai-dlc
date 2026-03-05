import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSSE } from '@/hooks/useSSE';
import { ordersApi } from '@/api/orders';
import { tablesApi } from '@/api/tables';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatPrice, formatDateTime } from '@/utils/format';
import type { Order, Table, SSEEvent, OrderStatus } from '@/types';

export function DashboardPage() {
  const { storeId, token } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterTableId, setFilterTableId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [highlightedTables, setHighlightedTables] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const fetchData = useCallback(async () => {
    if (!storeId) return;
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        tablesApi.getAll(storeId),
        ordersApi.getAll(storeId),
      ]);
      setTables(tablesRes.data);
      setOrders(ordersRes.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'ORDER_CREATED':
        setOrders((prev) => [...prev, event.data]);
        setHighlightedTables((prev) => new Set(prev).add(event.data.tableId));
        setTimeout(() => {
          setHighlightedTables((prev) => {
            const next = new Set(prev);
            next.delete(event.data.tableId);
            return next;
          });
        }, 3000);
        break;
      case 'ORDER_STATUS_CHANGED':
        setOrders((prev) =>
          prev.map((o) => o.id === event.data.orderId ? { ...o, status: event.data.status } : o),
        );
        break;
      case 'ORDER_DELETED':
        setOrders((prev) => prev.filter((o) => o.id !== event.data.orderId));
        break;
      case 'SESSION_COMPLETED':
        setOrders((prev) => prev.filter((o) => o.tableId !== event.data.tableId));
        if (selectedTableId === event.data.tableId) setSelectedTableId(null);
        break;
    }
  }, [selectedTableId]);

  useSSE({ storeId, token, onEvent: handleSSEEvent });

  const ordersByTable = orders.reduce<Record<number, Order[]>>((acc, order) => {
    if (!acc[order.tableId]) acc[order.tableId] = [];
    acc[order.tableId].push(order);
    return acc;
  }, {});

  const filteredTables = filterTableId
    ? tables.filter((t) => t.id === filterTableId)
    : tables;

  const getTableTotal = (tableId: number) =>
    (ordersByTable[tableId] || []).reduce((sum, o) => sum + o.totalAmount, 0);

  const handleStatusChange = async (orderId: number, currentStatus: OrderStatus) => {
    if (!storeId) return;
    const nextStatus: Record<string, OrderStatus> = { PENDING: 'PREPARING', PREPARING: 'COMPLETED' };
    const newStatus = nextStatus[currentStatus];
    if (!newStatus) return;
    try {
      const res = await ordersApi.updateStatus(storeId, orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...res.data } : o)));
    } catch { alert('상태 변경에 실패했습니다.'); }
  };

  const handleDeleteOrder = (orderId: number) => {
    setConfirmModal({
      isOpen: true, title: '주문 삭제',
      message: '이 주문을 삭제하시겠습니까? 삭제된 주문은 복구할 수 없습니다.',
      onConfirm: async () => {
        if (!storeId) return;
        try {
          await ordersApi.delete(storeId, orderId);
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch { alert('주문 삭제에 실패했습니다.'); }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCompleteSession = (tableId: number, tableNumber: number) => {
    setConfirmModal({
      isOpen: true, title: '이용 완료',
      message: `테이블 ${tableNumber}의 이용을 완료하시겠습니까? 현재 주문이 과거 이력으로 이동됩니다.`,
      onConfirm: async () => {
        if (!storeId) return;
        try {
          await tablesApi.complete(storeId, tableId);
          setOrders((prev) => prev.filter((o) => o.tableId !== tableId));
          setSelectedTableId(null);
        } catch { alert('이용 완료 처리에 실패했습니다.'); }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const selectedOrders = selectedTableId ? (ordersByTable[selectedTableId] || []) : [];
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>로딩 중...</div>;
  }

  return (
    <div data-testid="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>실시간 주문 대시보드</h1>
        <select
          data-testid="dashboard-table-filter"
          value={filterTableId ?? ''}
          onChange={(e) => setFilterTableId(e.target.value ? Number(e.target.value) : null)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
        >
          <option value="">전체 테이블</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>테이블 {t.tableNumber}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filteredTables.map((table) => {
          const tableOrders = ordersByTable[table.id] || [];
          const total = getTableTotal(table.id);
          const isHighlighted = highlightedTables.has(table.id);
          const latestOrder = tableOrders.length > 0
            ? tableOrders.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
            : null;

          return (
            <div
              key={table.id}
              data-testid={`dashboard-table-card-${table.id}`}
              onClick={() => setSelectedTableId(table.id)}
              style={{
                background: '#fff', borderRadius: '12px', padding: '20px',
                cursor: 'pointer', transition: 'all 0.3s',
                border: isHighlighted ? '2px solid #ff9800' : '2px solid transparent',
                boxShadow: isHighlighted ? '0 0 16px rgba(255,152,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>테이블 {table.tableNumber}</h3>
                <span style={{ fontSize: '13px', color: '#888' }}>{tableOrders.length}건</span>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>{formatPrice(total)}</p>
              {latestOrder && (
                <div style={{ fontSize: '13px', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{latestOrder.orderNumber}</span>
                    <OrderStatusBadge status={latestOrder.status} />
                  </div>
                </div>
              )}
              {tableOrders.length === 0 && <p style={{ fontSize: '13px', color: '#bbb' }}>주문 없음</p>}
            </div>
          );
        })}
      </div>

      {selectedTableId && selectedTable && (
        <div
          data-testid="order-detail-modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900 }}
          onClick={() => setSelectedTableId(null)}
        >
          <div
            data-testid="order-detail-modal"
            style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '600px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px' }}>테이블 {selectedTable.tableNumber} — 주문 상세</h2>
              <button data-testid="order-detail-close-button" onClick={() => setSelectedTableId(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            {selectedOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>주문이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedOrders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((order) => (
                    <div key={order.id} data-testid={`order-card-${order.id}`} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{order.orderNumber}</span>
                          <span style={{ marginLeft: '12px', fontSize: '13px', color: '#888' }}>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        {order.items.map((item) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' }}>
                            <span>{item.menuName} × {item.quantity}</span>
                            <span>{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
                          <span>합계</span><span>{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {order.status !== 'COMPLETED' && (
                          <button data-testid={`order-status-change-button-${order.id}`} onClick={() => handleStatusChange(order.id, order.status)}
                            style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#2196f3', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                            {order.status === 'PENDING' ? '준비 시작' : '완료 처리'}
                          </button>
                        )}
                        <button data-testid={`order-delete-button-${order.id}`} onClick={() => handleDeleteOrder(order.id)}
                          style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #e53935', background: '#fff', color: '#e53935', cursor: 'pointer', fontSize: '13px' }}>
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>총 {formatPrice(getTableTotal(selectedTableId))}</span>
              <button data-testid={`table-complete-button-${selectedTableId}`} onClick={() => handleCompleteSession(selectedTableId, selectedTable.tableNumber)}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                이용 완료
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
