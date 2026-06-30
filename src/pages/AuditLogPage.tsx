/**
 * Audit Log Page
 */
import { Shield, Download, User, FileText, Users, Key, Database } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const demoAuditLogs = [
  { id: '1', user: 'Chris Admin', action: 'user.login', resource: 'auth', details: 'Successful login', timestamp: '2025-05-23T14:00:00Z', icon: <Key size={14} /> },
  { id: '2', user: 'Chris Admin', action: 'form.publish', resource: 'Community Health Assessment', details: 'Published version 1', timestamp: '2025-05-23T13:30:00Z', icon: <FileText size={14} /> },
  { id: '3', user: 'Sarah Lead', action: 'form.create', resource: 'Water Source Survey', details: 'Created new form', timestamp: '2025-05-22T10:00:00Z', icon: <FileText size={14} /> },
  { id: '4', user: 'Chris Admin', action: 'user.invite', resource: 'emeka@datasurv.io', details: 'Invited as Field Officer', timestamp: '2025-05-21T09:00:00Z', icon: <Users size={14} /> },
  { id: '5', user: 'Chris Admin', action: 'role.assign', resource: 'Sarah Lead', details: 'Assigned Team Lead role', timestamp: '2025-05-20T14:30:00Z', icon: <Shield size={14} /> },
  { id: '6', user: 'Sarah Lead', action: 'response.delete', resource: 'Water Quality Lab Results', details: 'Deleted 3 responses', timestamp: '2025-05-19T16:00:00Z', icon: <Database size={14} /> },
  { id: '7', user: 'Chris Admin', action: 'data.export', resource: 'Health Assessment', details: 'Exported 127 responses as CSV', timestamp: '2025-05-18T11:00:00Z', icon: <Download size={14} /> },
  { id: '8', user: 'James Officer', action: 'user.login', resource: 'auth', details: 'Successful login', timestamp: '2025-05-17T08:00:00Z', icon: <Key size={14} /> },
];

const actionColors: Record<string, { bg: string; text: string }> = {
  'user.login': { bg: 'var(--color-surface-100)', text: 'var(--color-surface-600)' },
  'user.invite': { bg: 'var(--color-primary-100)', text: 'var(--color-primary-700)' },
  'form.create': { bg: 'var(--color-accent-100)', text: 'var(--color-accent-700)' },
  'form.publish': { bg: '#dbeafe', text: '#1d4ed8' },
  'role.assign': { bg: '#f3e8ff', text: '#7c3aed' },
  'response.delete': { bg: '#fee2e2', text: '#991b1b' },
  'data.export': { bg: '#fef3c7', text: '#92400e' },
};

export function AuditLogPage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Track all significant user actions across the organisation.</p>
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={16} /> Export Log</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-50)', borderBottom: '1px solid var(--color-surface-200)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>User</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Action</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Resource</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Details</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {demoAuditLogs.map((log) => {
              const ac = actionColors[log.action] || actionColors['user.login'];
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-surface-100)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} style={{ color: 'var(--color-surface-400)' }} />
                      <span style={{ color: 'var(--color-surface-700)', fontWeight: 500 }}>{log.user}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge" style={{ background: ac.bg, color: ac.text }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-surface-700)' }}>{log.resource}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-surface-500)' }}>{log.details}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-surface-400)', whiteSpace: 'nowrap' }}>{formatDate(log.timestamp, { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
