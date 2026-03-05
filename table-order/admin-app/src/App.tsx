import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/common/AuthGuard';
import { RoleGuard } from '@/components/common/RoleGuard';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TableManagementPage } from '@/pages/TableManagementPage';
import { MenuManagementPage } from '@/pages/MenuManagementPage';
import { AdminManagementPage } from '@/pages/AdminManagementPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tables" element={<TableManagementPage />} />
          <Route
            path="/menus"
            element={
              <RoleGuard requiredRole="OWNER">
                <MenuManagementPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admins"
            element={
              <RoleGuard requiredRole="OWNER">
                <AdminManagementPage />
              </RoleGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
