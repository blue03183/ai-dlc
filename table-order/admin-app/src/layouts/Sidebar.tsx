import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', label: '📋 대시보드', roles: ['OWNER', 'MANAGER'] },
  { to: '/tables', label: '🪑 테이블 관리', roles: ['OWNER', 'MANAGER'] },
  { to: '/menus', label: '🍽️ 메뉴 관리', roles: ['OWNER'] },
  { to: '/admins', label: '👤 관리자', roles: ['OWNER'] },
];

export function Sidebar() {
  const { admin, logout } = useAuth();

  return (
    <aside
      data-testid="sidebar"
      style={{
        width: '220px', minHeight: '100vh', background: '#1a1a2e',
        color: '#fff', display: 'flex', flexDirection: 'column',
        padding: '20px 0', flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #333' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>테이블오더</h2>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#aaa' }}>
          {admin?.storeName}
        </p>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {navItems
          .filter((item) => admin && item.roles.includes(admin.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              data-testid={`sidebar-nav-${item.to.replace('/', '') || 'dashboard'}`}
              style={({ isActive }) => ({
                display: 'block', padding: '12px 20px', color: isActive ? '#fff' : '#aaa',
                textDecoration: 'none', fontSize: '15px',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #4fc3f7' : '3px solid transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #333' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#aaa' }}>
          {admin?.username} ({admin?.role === 'OWNER' ? '오너' : '관리자'})
        </p>
        <button
          data-testid="sidebar-logout-button"
          onClick={logout}
          style={{
            width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #555',
            background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '13px',
          }}
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
