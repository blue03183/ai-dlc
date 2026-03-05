import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { menuApi } from '@/api';
import MenuDetailModal from '@/components/MenuDetailModal';
import type { Category, Menu, CartItem } from '@/types';

export default function MenuPage() {
  const { auth } = useAuth();
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    Promise.all([menuApi.getCategories(auth.storeId), menuApi.getMenus(auth.storeId)])
      .then(([cats, items]) => {
        setCategories(cats);
        setMenus(items);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth]);

  const filtered = menus.filter((m) => m.isAvailable && (selectedCategoryId ? m.categoryId === selectedCategoryId : true));

  const handleAdd = useCallback((menu: Menu, qty: number) => {
    const item: Omit<CartItem, 'quantity'> = { menuId: menu.id, menuName: menu.name, unitPrice: menu.price, imageUrl: menu.imageUrl };
    addItem(item, qty);
    setSelectedMenu(null);
  }, [addItem]);

  if (loading) return <div className="loading">메뉴를 불러오는 중...</div>;

  return (
    <div className="page">
      <nav className="category-tabs" aria-label="메뉴 카테고리">
        {categories.map((c) => (
          <button key={c.id} className={`category-tab${selectedCategoryId === c.id ? ' active' : ''}`} onClick={() => setSelectedCategoryId(c.id)} aria-pressed={selectedCategoryId === c.id}>
            {c.name}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><p>등록된 메뉴가 없습니다.</p></div>
      ) : (
        <div className="menu-grid">
          {filtered.map((m) => (
            <button key={m.id} className="menu-card" onClick={() => setSelectedMenu(m)} type="button" aria-label={`${m.name} ${m.price.toLocaleString()}원`}>
              {m.imageUrl ? <img src={m.imageUrl} alt={m.name} className="menu-card-img" /> : <div className="menu-card-img no-image">🍽️</div>}
              <div className="menu-card-body">
                <div className="menu-card-name">{m.name}</div>
                <div className="menu-card-price">{m.price.toLocaleString()}원</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMenu && <MenuDetailModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} onAddToCart={handleAdd} />}
    </div>
  );
}
