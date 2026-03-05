import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { adminsApi } from '@/api/admins';
import { formatDateTime, formatAdminRole } from '@/utils/format';
import type { Admin, AdminRole } from '@/types';

export function AdminManagementPage() {
  const { storeId } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // 생성 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('MANAGER');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await adminsApi.getAll(storeId);
      setAdmins(res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setCreateError('');
    setCreateLoading(true);
    try {
      const res = await adminsApi.create(storeId, {
        username: newUsername, password: newPassword, role: newRole,
      });
      setAdmins((prev) => [...prev, res.data]);
      setShowCreateModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewRole('MANAGER');
    } catch {
      setCreateError('관리자 생성에 실패했습니다. 사용자명이 중복되었을 수 있습니다.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>로딩 중...</div>;
  }

  return (
    <div data-testid="admin-management-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>관리자 계정 관리</h1>
        <button
          data-testid="admin-add-button"
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: '#1a1a2e', color: '#fff', cursor: 'pointer', fontSize: '14px',
          }}
        >
          + 관리자 추가
        </button>
      </div>

      {/* 관리자 목록 */}
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', color: '#888' }}>사용자명</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', color: '#888' }}>역할</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', color: '#888' }}>생성일</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} data-testid={`admin-row-${admin.id}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{admin.username}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '10px', fontSize: '13px',
                    background: admin.role === 'OWNER' ? '#e8f5e9' : '#e3f2fd',
                    color: admin.role === 'OWNER' ? '#2e7d32' : '#1565c0',
                  }}>
                    {formatAdminRole(admin.role)}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#888', fontSize: '14px' }}>
                  {formatDateTime(admin.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 관리자 생성 모달 */}
      {showCreateModal && (
        <div
          data-testid="admin-create-modal-overlay"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            data-testid="admin-create-modal"
            style={{
              background: '#fff', borderRadius: '12px', padding: '24px',
              width: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>관리자 계정 생성</h3>

            {createError && (
              <div style={{ padding: '10px', borderRadius: '8px', background: '#ffebee', color: '#c62828', marginBottom: '16px', fontSize: '14px' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="adminUsername" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  사용자명
                </label>
                <input
                  id="adminUsername"
                  data-testid="admin-create-username-input"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="adminPassword" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  비밀번호
                </label>
                <input
                  id="adminPassword"
                  data-testid="admin-create-password-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="adminRole" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  역할
                </label>
                <select
                  id="adminRole"
                  data-testid="admin-create-role-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="MANAGER">일반 관리자</option>
                  <option value="OWNER">오너</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  data-testid="admin-create-submit-button"
                  type="submit"
                  disabled={createLoading}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', border: 'none',
                    background: '#1a1a2e', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {createLoading ? '생성 중...' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
