import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function SetupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [storeIdentifier, setStoreIdentifier] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ storeIdentifier, tableNumber: Number(tableNumber), password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <h1 className="setup-title">🍽️ 테이블오더</h1>
        <p className="setup-subtitle">테이블 초기 설정</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="store-id">매장 식별자</label>
            <input id="store-id" type="text" value={storeIdentifier} onChange={(e) => setStoreIdentifier(e.target.value)} placeholder="매장 식별자를 입력하세요" required autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="table-num">테이블 번호</label>
            <input id="table-num" type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="테이블 번호를 입력하세요" required min="1" />
          </div>
          <div className="form-group">
            <label htmlFor="table-pw">비밀번호</label>
            <input id="table-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="테이블 비밀번호를 입력하세요" required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '로그인 중...' : '설정 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
