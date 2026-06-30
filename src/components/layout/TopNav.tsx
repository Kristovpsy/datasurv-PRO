/**
 * TopNav Component
 * --------------------------
 * Top navigation bar with search, notifications, and user menu.
 */

import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/stores';
import { getInitials } from '@/lib/utils';

export function TopNav() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header
      style={{
        height: 'var(--topnav-height)',
        background: 'var(--color-surface-0)',
        borderBottom: '1px solid var(--color-surface-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-icon"
          style={{ display: 'none' }} // Show on mobile via media query
          id="mobile-menu-toggle"
        >
          <Menu size={20} />
        </button>

        <div
          style={{
            position: 'relative',
            width: 320,
            maxWidth: '100%',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-surface-400)',
            }}
          />
          <input
            type="text"
            placeholder="Search forms, projects..."
            className="input"
            style={{
              paddingLeft: '2.5rem',
              height: 38,
              fontSize: '0.8125rem',
              background: 'var(--color-surface-50)',
              border: '1px solid var(--color-surface-200)',
            }}
            id="global-search"
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Notifications */}
        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          id="notifications-button"
          title="Notifications"
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-danger)',
              border: '2px solid var(--color-surface-0)',
            }}
          />
        </button>

        {/* User Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginLeft: '0.5rem',
            padding: '0.375rem 0.75rem 0.375rem 0.375rem',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-50)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          id="user-menu-button"
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {user?.profile?.full_name ? getInitials(user.profile.full_name) : '?'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-surface-800)' }}>
              {user?.profile?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)' }}>
              {user?.organisation?.name || 'Organisation'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
