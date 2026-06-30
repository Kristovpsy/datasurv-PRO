/**
 * Team Management Page
 * --------------------------
 * Manage team members and role assignments.
 * Accessible by Editor+ (editors can invite field officers).
 */
import { useState } from 'react';
import { Plus, Mail, MoreVertical, Search } from 'lucide-react';
import { formatRole, getInitials } from '@/lib/utils';
import type { UserRole } from '@/types';
import { useAuthStore } from '@/stores';

interface TeamMember {
  id: string; name: string; email: string; role: UserRole;
  avatar_color: string; last_active: string; status: 'active' | 'pending';
}

const demoTeam: TeamMember[] = [
  { id: '1', name: 'Chris Admin', email: 'admin@datasurv.io', role: 'admin', avatar_color: '#6366f1', last_active: '2 hours ago', status: 'active' },
  { id: '2', name: 'Sarah Editor', email: 'editor@datasurv.io', role: 'editor', avatar_color: '#10b981', last_active: '1 day ago', status: 'active' },
  { id: '3', name: 'James Officer', email: 'officer@datasurv.io', role: 'field_officer', avatar_color: '#f59e0b', last_active: '3 hours ago', status: 'active' },
  { id: '4', name: 'Amina Bello', email: 'amina@datasurv.io', role: 'field_officer', avatar_color: '#ec4899', last_active: '5 days ago', status: 'active' },
  { id: '5', name: 'Emeka Nwachukwu', email: 'emeka@datasurv.io', role: 'field_officer', avatar_color: '#8b5cf6', last_active: 'Pending', status: 'pending' },
];

export function TeamManagementPage() {
  const { user } = useAuthStore();
  const userRole = user?.role?.role || 'field_officer';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const filtered = demoTeam.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()));

  // Editors can only invite field officers; Admin can invite all roles
  const availableRoles: { value: UserRole; label: string }[] = isAdmin
    ? [
        { value: 'field_officer', label: 'Field Officer' },
        { value: 'editor', label: 'Data Editor' },
        { value: 'admin', label: 'Admin' },
      ]
    : [
        { value: 'field_officer', label: 'Field Officer' },
      ];

  const roleBadgeColors: Record<UserRole, { bg: string; text: string }> = {
    superadmin: { bg: '#fee2e2', text: '#991b1b' },
    admin: { bg: 'var(--color-primary-100)', text: 'var(--color-primary-700)' },
    editor: { bg: 'var(--color-accent-100)', text: 'var(--color-accent-700)' },
    field_officer: { bg: 'var(--color-surface-100)', text: 'var(--color-surface-600)' },
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage team members and role assignments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)} id="invite-member-btn">
          <Plus size={18} /> Invite Member
        </button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowInvite(false)} />
          <div className="card animate-scale-in" style={{ position: 'relative', zIndex: 1, width: 440, padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1.5rem' }}>Invite Team Member</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Enter full name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="name@company.com" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input">
                  {availableRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {!isAdmin && (
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)', marginTop: '0.25rem' }}>
                    As an editor, you can invite field officers. Contact an admin to invite editors or admins.
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setShowInvite(false)}><Mail size={16} /> Send Invite</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-surface-400)' }} />
        <input className="input" placeholder="Search team members..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.5rem', height: 38, fontSize: '0.8125rem' }} />
      </div>

      {/* Role Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
        {[
          { role: 'admin' as UserRole, label: 'Admin — View analytics & reports (read-only)' },
          { role: 'editor' as UserRole, label: 'Editor — Review, edit & approve data' },
          { role: 'field_officer' as UserRole, label: 'Field Officer — Collect & submit data' },
        ].map(r => {
          const rc = roleBadgeColors[r.role];
          return (
            <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: rc.text, flexShrink: 0 }} />
              <span style={{ color: 'var(--color-surface-500)' }}>{r.label}</span>
            </div>
          );
        })}
      </div>

      {/* Team List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.map((member, i) => {
          const rc = roleBadgeColors[member.role];
          return (
            <div key={member.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--color-surface-100)' : 'none',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-50)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)', background: member.avatar_color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0,
              }}>{getInitials(member.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-surface-800)' }}>{member.name}</span>
                  {member.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)' }}>{member.email}</span>
              </div>
              <span className="badge" style={{ background: rc.bg, color: rc.text }}>{formatRole(member.role)}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', minWidth: 80, textAlign: 'right' }}>{member.last_active}</span>
              <button className="btn btn-ghost btn-icon btn-sm"><MoreVertical size={16} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
