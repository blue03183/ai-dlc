import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { orderApi } from '@/api';

export default function CartPage() {
  const { auth } = useAuth();
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');
  const [successOrderNumber, setSuccessOrderNumber] = useState('');

  const handleOrder = async () => {
    if (!auth || items.length === 0) return;
    setOrdering(true);
    setError('');
    try {
      const res = await orderApi.create(auth.storeId, {
        tableId: auth.tableId,
        items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
      });
      clearCart();
      setSuccessOrderNumber(res.orderNumber);
      setTimeout(() => navigate('/'), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문에 실패했습니다.');
    } finally {
      setOrdering(false);
    }
  };

  if (successOrderNumber) {
    return (
      <div className="success-overlay">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <div className="success-title">주문이 완료되었습니다</div>
          <div className="success-order-number">{successOrderNumber}</div>
          <p className="success-redirect-msg">5초 후 메뉴 화면으로 이동합니다</p>
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate('/')}>메뉴로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>장바구니가 비어있습니다.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>메뉴 보러가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: 140 }}>
      <div className="page-header">
        <h2 className="page-title">장바구니</h2>
        <button className="btn btn-sm btn-outline" onClick={clearCart}>비우기</button>
      </div>

      <div>
        {items.map((item) => (
          <div key={item.menuId} className="cart-item">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.menuName} className="cart-item-img" /> : <div className="cart-item-img no-image">🍽️</div>}
            <div className="cart-item-info">
              <div className="cart-item-name">{item.menuName}</div>
              <div className="cart-item-price">{item.unitPrice.toLocaleString()}원</div>
              <div className="qty-control" style={{ marginTop: 6 }}>
                <button className="qty-btn" onClick={() => updateQuantity(item.menuId, item.quantity - 1)} aria-label={`${item.menuName} 수량 감소`}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.menuId, item.quantity + 1)} aria-label={`${item.menuName} 수량 증가`}>+</button>
              </div>
            </div>
            <button className="cart-item-remove" onClick={() => removeItem(item.menuId)} aria-label={`${item.menuName} 삭제`}>삭제</button>
          </div>
        ))}
      </div>

      {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

      <div className="cart-summary">
        <div>
          <div className="cart-summary-label">총 금액</div>
          <div className="cart-summary-amount">{totalAmount.toLocaleString()}원</div>
        </div>
        <button className="btn btn-primary" onClick={handleOrder} disabled={ordering} style={{ minWidth: 140 }}>
          {ordering ? '주문 중...' : `주문하기 (${items.length}건)`}
        </button>
      </div>
    </div>
  );
}
