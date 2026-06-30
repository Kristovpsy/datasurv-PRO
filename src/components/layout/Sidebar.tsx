/**
 * Sidebar Component
 * --------------------------
 * RBAC-driven navigation sidebar with collapsible state.
 *
 * Role visibility:
 *   Field Officer: Dashboard, My Submissions
 *   Editor:        Dashboard, Projects, All Forms, Review Queue, Team
 *   Admin:         Dashboard, Projects, All Forms, Analytics, Team, Audit Log, Settings
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  ClipboardCheck,
  Send,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/stores';
import { cn, formatRole } from '@/lib/utils';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/app/dashboard',
    roles: ['field_officer', 'editor', 'admin', 'superadmin'],
  },
  {
    label: 'My Submissions',
    icon: <Send size={20} />,
    path: '/app/my-submissions',
    roles: ['field_officer'],
  },
  {
    label: 'Projects',
    icon: <FolderOpen size={20} />,
    path: '/app/projects',
    roles: ['editor', 'admin', 'superadmin'],
  },
  {
    label: 'All Forms',
    icon: <FileText size={20} />,
    path: '/app/forms',
    roles: ['editor', 'admin', 'superadmin'],
  },
  {
    label: 'Review Queue',
    icon: <ClipboardCheck size={20} />,
    path: '/app/review',
    roles: ['editor', 'superadmin'],
  },
  {
    label: 'Team',
    icon: <Users size={20} />,
    path: '/app/team',
    roles: ['editor', 'admin', 'superadmin'],
  },
  {
    label: 'Audit Log',
    icon: <Shield size={20} />,
    path: '/app/audit-log',
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/app/settings',
    roles: ['admin', 'superadmin'],
  },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();
  const userRole = user?.role?.role || 'field_officer';

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole as UserRole));

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <aside
      className={cn(
        'sidebar',
        sidebarCollapsed && 'sidebar--collapsed'
      )}
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--color-surface-0)',
        borderRight: '1px solid var(--color-surface-200)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-slow)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: sidebarCollapsed ? '1.25rem 0.75rem' : '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--color-surface-100)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={20} color="white" />
        </div>
        {!sidebarCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-surface-900)', whiteSpace: 'nowrap' }}>
              Datasurv
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)', whiteSpace: 'nowrap' }}>
              Field Research Platform
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: sidebarCollapsed ? '0.625rem' : '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-primary-700)' : 'var(--color-surface-600)',
              background: isActive ? 'var(--color-primary-50)' : 'transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
            title={item.label}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-surface-100)' }}>
        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-50)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>
              {user.profile?.full_name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)', marginTop: '0.125rem' }}>
              {formatRole(userRole)}
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleSidebarCollapsed}
          className="btn btn-ghost"
          style={{
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            marginBottom: '0.25rem',
          }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            color: 'var(--color-danger)',
          }}
          title="Logout"
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
