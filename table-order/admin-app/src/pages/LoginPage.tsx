import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [storeIdentifier, setStoreIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ storeIdentifier, username, password });
      login(res.data);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 403) {
        setError('계정이 일시적으로 잠겼습니다. 잠시 후 다시 시도해주세요.');
      } else if (axiosErr.response?.status === 401) {
        setError('매장 식별자, 사용자명 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-page"
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#1a1a2e',
      }}
    >
      <form
        data-testid="login-form"
        onSubmit={handleSubmit}
        style={{
          background: '#fff', borderRadius: '16px', padding: '40px',
          width: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '24px' }}>
          테이블오더 관리자
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '32px', fontSize: '14px' }}>
          매장 관리 시스템에 로그인하세요
        </p>

        {error && (
          <div
            data-testid="login-error-message"
            style={{
              padding: '12px', borderRadius: '8px', background: '#ffebee',
              color: '#c62828', marginBottom: '16px', fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="storeIdentifier" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
            매장 식별자
          </label>
          <input
            id="storeIdentifier"
            data-testid="login-store-identifier-input"
            type="text"
            value={storeIdentifier}
            onChange={(e) => setStoreIdentifier(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
            사용자명
          </label>
          <input
            id="username"
            data-testid="login-username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
            비밀번호
          </label>
          <input
            id="password"
            data-testid="login-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
          />
        </div>

        <button
          data-testid="login-submit-button"
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: loading ? '#999' : '#1a1a2e', color: '#fff',
            fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
