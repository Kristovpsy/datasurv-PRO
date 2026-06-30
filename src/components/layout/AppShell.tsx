/**
 * AppShell Layout
 * --------------------------
 * Main authenticated layout wrapper.
 * Provides sidebar + topnav + content area.
 */

import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ToastContainer } from './ToastContainer';
import { useAuthStore, useUIStore } from '@/stores';

export function AppShell() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-surface-50)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-surface-200)',
            borderTopColor: 'var(--color-primary-500)',
            borderRadius: '50%',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: 'var(--color-surface-500)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-50)' }}>
      <Sidebar />
      <div
        style={{
          marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          transition: 'margin-left var(--transition-slow)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopNav />
        <main style={{ flex: 1, padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
