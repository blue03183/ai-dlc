import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { tablesApi } from '@/api/tables';
import { formatPrice, formatDateTime } from '@/utils/format';
import type { Table, OrderHistory } from '@/types';

export function TableManagementPage() {
  const { storeId } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // 테이블 추가 모달 (US-601)
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTablePassword, setNewTablePassword] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // 과거 주문 내역 모달 (US-604)
  const [historyTableId, setHistoryTableId] = useState<number | null>(null);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchTables = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await tablesApi.getAll(storeId);
      setTables(res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  // 테이블 생성 (US-601)
  const handleCreateTable = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setSetupError('');
    setSetupLoading(true);
    try {
      const res = await tablesApi.create(storeId, {
        tableNumber: Number(newTableNumber),
        password: newTablePassword,
      });
      setTables((prev) => [...prev, res.data]);
      setShowSetupModal(false);
      setNewTableNumber('');
      setNewTablePassword('');
    } catch {
      setSetupError('테이블 생성에 실패했습니다.');
    } finally {
      setSetupLoading(false);
    }
  };

  // 과거 주문 내역 조회 (US-604)
  const fetchHistory = useCallback(async (tableId: number) => {
    if (!storeId) return;
    setHistoryLoading(true);
    try {
      const res = await tablesApi.getOrderHistory(storeId, tableId, dateFrom || undefined, dateTo || undefined);
      setHistory(res.data);
    } catch { /* ignore */ } finally {
      setHistoryLoading(false);
    }
  }, [storeId, dateFrom, dateTo]);

  const openHistory = (tableId: number) => {
    setHistoryTableId(tableId);
    fetchHistory(tableId);
  };

  const historyTable = tables.find((t) => t.id === historyTableId);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>로딩 중...</div>;
  }

  return (
    <div data-testid="table-management-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>테이블 관리</h1>
        <button
          data-testid="table-add-button"
          onClick={() => setShowSetupModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: '#1a1a2e', color: '#fff', cursor: 'pointer', fontSize: '14px',
          }}
        >
          + 테이블 추가
        </button>
      </div>

      {/* 테이블 목록 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {tables.map((table) => (
          <div
            key={table.id}
            data-testid={`table-card-${table.id}`}
            style={{
              background: '#fff', borderRadius: '12px', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>테이블 {table.tableNumber}</h3>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
              생성: {formatDateTime(table.createdAt)}
            </p>
            <button
              data-testid={`table-history-button-${table.id}`}
              onClick={() => openHistory(table.id)}
              style={{
                width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd',
                background: '#fff', cursor: 'pointer', fontSize: '13px',
              }}
            >
              📋 과거 주문 내역
            </button>
          </div>
        ))}
      </div>

      {/* 테이블 추가 모달 (US-601) */}
      {showSetupModal && (
        <div
          data-testid="table-setup-modal-overlay"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowSetupModal(false)}
        >
          <div
            data-testid="table-setup-modal"
            style={{
              background: '#fff', borderRadius: '12px', padding: '24px',
              width: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>테이블 초기 설정</h3>
            {setupError && (
              <div style={{ padding: '10px', borderRadius: '8px', background: '#ffebee', color: '#c62828', marginBottom: '16px', fontSize: '14px' }}>
                {setupError}
              </div>
            )}
            <form onSubmit={handleCreateTable}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="tableNumber" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  테이블 번호
                </label>
                <input
                  id="tableNumber"
                  data-testid="table-setup-number-input"
                  type="number"
                  min="1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="tablePassword" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  비밀번호
                </label>
                <input
                  id="tablePassword"
                  data-testid="table-setup-password-input"
                  type="password"
                  value={newTablePassword}
                  onChange={(e) => setNewTablePassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  data-testid="table-setup-submit-button"
                  type="submit"
                  disabled={setupLoading}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', border: 'none',
                    background: '#1a1a2e', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {setupLoading ? '생성 중...' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 과거 주문 내역 모달 (US-604) */}
      {historyTableId && historyTable && (
        <div
          data-testid="order-history-modal-overlay"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setHistoryTableId(null)}
        >
          <div
            data-testid="order-history-modal"
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              width: '600px', maxHeight: '80vh', overflow: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px' }}>테이블 {historyTable.tableNumber} — 과거 주문 내역</h2>
              <button
                data-testid="order-history-close-button"
                onClick={() => setHistoryTableId(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>

            {/* 날짜 필터 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <input
                data-testid="history-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
              <span>~</span>
              <input
                data-testid="history-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
              <button
                data-testid="history-filter-button"
                onClick={() => fetchHistory(historyTableId)}
                style={{
                  padding: '6px 16px', borderRadius: '6px', border: 'none',
                  background: '#1a1a2e', color: '#fff', cursor: 'pointer', fontSize: '13px',
                }}
              >
                조회
              </button>
            </div>

            {historyLoading ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>로딩 중...</p>
            ) : history.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>과거 주문 내역이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((h) => (
                  <div key={h.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{h.orderNumber}</span>
                      <span style={{ fontSize: '13px', color: '#888' }}>
                        주문: {formatDateTime(h.orderedAt)}
                      </span>
                    </div>
                    {h.orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '2px 0' }}>
                        <span>{item.menuName} × {item.quantity}</span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
                      <span>합계</span>
                      <span>{formatPrice(h.totalAmount)}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                      이용 완료: {formatDateTime(h.completedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
