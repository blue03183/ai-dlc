import { useState } from 'react';
import type { Menu } from '@/types';

interface Props {
  menu: Menu;
  onClose: () => void;
  onAddToCart: (menu: Menu, quantity: number) => void;
}

export default function MenuDetailModal({ menu, onClose, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${menu.name} 상세`}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {menu.imageUrl ? (
          <img src={menu.imageUrl} alt={menu.name} className="modal-img" />
        ) : (
          <div className="modal-img no-image">🍽️</div>
        )}
        <h2 className="modal-menu-name">{menu.name}</h2>
        <p className="modal-menu-price">{menu.price.toLocaleString()}원</p>
        {menu.description && <p className="modal-menu-desc">{menu.description}</p>}

        <div className="qty-control-center">
          <div className="qty-control">
            <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="수량 감소">−</button>
            <span className="qty-value" aria-live="polite">{quantity}</span>
            <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)} aria-label="수량 증가">+</button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>닫기</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onAddToCart(menu, quantity)}>
            장바구니 담기 ({(menu.price * quantity).toLocaleString()}원)
          </button>
        </div>
      </div>
    </div>
  );
}
