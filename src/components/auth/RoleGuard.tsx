/**
 * RoleGuard Component
 * --------------------------
 * HOC that checks user role before rendering children.
 * Per Section 5: enforced at frontend route level (one of three enforcement layers).
 */

import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores';
import type { UserRole } from '@/types';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuthStore();
  const userRole = user?.role?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <ShieldX size={48} className="empty-state-icon" style={{ color: 'var(--color-danger)' }} />
        <h2 className="empty-state-title">Access Denied</h2>
        <p className="empty-state-text">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
