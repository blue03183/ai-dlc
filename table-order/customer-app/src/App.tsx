import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider, useCart } from '@/contexts/CartContext';
import SetupPage from '@/pages/SetupPage';
import MenuPage from '@/pages/MenuPage';
import CartPage from '@/pages/CartPage';
import OrdersPage from '@/pages/OrdersPage';

function AppRoutes() {
  const { auth, loading } = useAuth();

  if (loading) return <div className="loading">로딩 중...</div>;

  if (!auth) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <CartProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </CartProvider>
  );
}

function Header() {
  const { auth, logout } = useAuth();
  return (
    <header className="header">
      <div>
        <div className="header-title">🍽️ 테이블오더</div>
        {auth && <div className="header-subtitle">{auth.storeName} · 테이블 {auth.tableNumber}</div>}
      </div>
      <button className="btn btn-sm btn-outline" onClick={logout}>초기화</button>
    </header>
  );
}

function BottomNav() {
  const { totalCount } = useCart();
  return (
    <nav className="bottom-nav" aria-label="메인 네비게이션">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon" aria-hidden="true">📋</span>메뉴
      </NavLink>
      <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon" aria-hidden="true">🛒</span>장바구니
        {totalCount > 0 && <span className="cart-badge" aria-label={`장바구니 ${totalCount}개`}>{totalCount}</span>}
      </NavLink>
      <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>
        <span className="nav-icon" aria-hidden="true">📝</span>주문내역
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
