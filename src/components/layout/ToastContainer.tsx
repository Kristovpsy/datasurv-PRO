/**
 * Toast Notification Component
 * --------------------------
 * Renders floating toast notifications.
 */

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '@/stores';

const iconMap = {
  success: <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />,
  error: <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />,
  warning: <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />,
  info: <Info size={18} style={{ color: 'var(--color-info)' }} />,
};

const bgMap = {
  success: 'var(--color-accent-50)',
  error: '#fee2e2',
  warning: '#fef3c7',
  info: '#dbeafe',
};

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: 400,
      }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className="animate-slide-in-right"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            background: bgMap[n.type],
            border: '1px solid var(--color-surface-200)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[n.type]}</span>
          <p style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--color-surface-800)', margin: 0 }}>
            {n.message}
          </p>
          <button
            onClick={() => removeNotification(n.id)}
            style={{
              flexShrink: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-surface-400)',
              padding: 2,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
