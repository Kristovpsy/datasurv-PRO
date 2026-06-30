/**
 * Organisation Settings Page (Super Admin only)
 */
import { Building2, CreditCard, Globe, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores';

export function OrgSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Organisation Settings</h1>
        <p className="page-subtitle">Manage your organisation's configuration and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Settings Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { label: 'General', icon: <Building2 size={16} />, active: true },
            { label: 'Billing', icon: <CreditCard size={16} />, active: false },
            { label: 'Domain', icon: <Globe size={16} />, active: false },
            { label: 'Security', icon: <Shield size={16} />, active: false },
            { label: 'Notifications', icon: <Bell size={16} />, active: false },
          ].map(item => (
            <button key={item.label} className="btn btn-ghost" style={{
              justifyContent: 'flex-start', fontWeight: item.active ? 600 : 400,
              background: item.active ? 'var(--color-primary-50)' : 'transparent',
              color: item.active ? 'var(--color-primary-700)' : 'var(--color-surface-600)',
            }}>{item.icon} {item.label}</button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1.5rem' }}>General Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 480 }}>
            <div>
              <label className="label">Organisation Name</label>
              <input className="input" defaultValue={user?.organisation?.name || 'Datasurv Research Lab'} />
            </div>
            <div>
              <label className="label">Organisation Slug</label>
              <input className="input" defaultValue={user?.organisation?.slug || 'datasurv-research'} />
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)', marginTop: '0.25rem' }}>Used in URLs and API paths.</p>
            </div>
            <div>
              <label className="label">Plan</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}>Pro</span>
                <button className="btn btn-ghost btn-sm">Upgrade</button>
              </div>
            </div>
            <div>
              <label className="label">Default Timezone</label>
              <select className="input">
                <option>Africa/Lagos (WAT, UTC+1)</option>
                <option>UTC</option>
                <option>Europe/London (GMT/BST)</option>
              </select>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
