import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { AdminRole } from '@/types';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requiredRole: AdminRole;
}

export function RoleGuard({ children, requiredRole }: Props) {
  const { admin } = useAuth();

  if (!admin || admin.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
