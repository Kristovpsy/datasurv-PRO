/**
 * Dashboard Page
 * --------------------------
 * Role-specific dashboard views:
 *   Field Officer: submission stats + quick submit link
 *   Editor: review queue stats + recent approvals
 *   Admin: high-level analytics overview (read-only)
 */

import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, BarChart3, TrendingUp, ArrowRight,
  FolderOpen, Clock, Activity, Plus,
  ClipboardCheck, Send, CheckCircle2, XCircle, AlertCircle,
  Eye, Shield, Edit3, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useForms, useProjects } from '@/hooks';
import { formatRelativeTime, formatRole, formatCompactNumber } from '@/lib/utils';
import { demoResponses } from '@/services/demoData';
import type { Form } from '@/types';

function StatCard({ label, value, change, icon, gradient }: {
  label: string; value: string | number; change?: string;
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', background: gradient, opacity: 0.08,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-500)', marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-surface-900)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 500 }}>{change}</span>
            </div>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
        }}>{icon}</div>
      </div>
    </div>
  );
}

function RecentFormCard({ form }: { form: Form }) {
  const navigate = useNavigate();
  const sc: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'var(--color-surface-100)', text: 'var(--color-surface-600)' },
    published: { bg: 'var(--color-accent-100)', text: 'var(--color-accent-700)' },
    closed: { bg: '#fee2e2', text: '#991b1b' },
    archived: { bg: '#fef3c7', text: '#92400e' },
  };
  const s = sc[form.status] || sc.draft;
  return (
    <div className="card card-interactive" style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
      onClick={() => navigate(`/app/forms/${form.id}/builder`)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>{form.title}</h4>
        <span className="badge" style={{ background: s.bg, color: s.text }}>{form.status}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-500)', marginBottom: '0.75rem' }}>{form.description || 'No description'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-surface-400)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} />{formatRelativeTime(form.updated_at)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BarChart3 size={12} />v{form.current_version}</span>
      </div>
    </div>
  );
}

// ---- Field Officer Dashboard ----
function FieldOfficerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const myResponses = demoResponses.filter(r => r.respondent_id === user?.id || true); // demo: show all
  const pendingCount = myResponses.filter(r => r.approval_status === 'pending').length;
  const approvedCount = myResponses.filter(r => r.approval_status === 'approved').length;
  const rejectedCount = myResponses.filter(r => r.approval_status === 'rejected').length;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Submissions" value={myResponses.length} icon={<Send size={22} />} gradient="linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))" />
        <StatCard label="Pending Review" value={pendingCount} icon={<AlertCircle size={22} />} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
        <StatCard label="Approved" value={approvedCount} icon={<CheckCircle2 size={22} />} gradient="linear-gradient(135deg, #10b981, #059669)" />
        <StatCard label="Rejected" value={rejectedCount} icon={<XCircle size={22} />} gradient="linear-gradient(135deg, #ef4444, #dc2626)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="card card-interactive" style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              onClick={() => navigate('/app/my-submissions')}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
                <Send size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>View My Submissions</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)' }}>Track the status of all your submitted data</p>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--color-surface-400)', marginLeft: 'auto' }} />
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Recent Activity</h3>
          <div className="card" style={{ padding: 0 }}>
            {myResponses.slice(0, 5).map((r, i) => (
              <div key={r.id} style={{
                padding: '0.75rem 1rem',
                borderBottom: i < 4 ? '1px solid var(--color-surface-100)' : 'none',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: r.approval_status === 'approved' ? '#10b981' : r.approval_status === 'rejected' ? '#ef4444' : '#f59e0b',
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-700)', fontWeight: 500 }}>{r.id}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)' }}>{formatRelativeTime(r.submitted_at)}</p>
                </div>
                <span className="badge" style={{
                  background: r.approval_status === 'approved' ? '#d1fae5' : r.approval_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color: r.approval_status === 'approved' ? '#10b981' : r.approval_status === 'rejected' ? '#ef4444' : '#f59e0b',
                  fontSize: '0.6875rem',
                }}>{r.approval_status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Editor Dashboard ----
function EditorDashboard() {
  const navigate = useNavigate();
  const { data: forms = [] } = useForms();
  const { data: projects = [] } = useProjects();

  const pendingCount = demoResponses.filter(r => r.approval_status === 'pending').length;
  const approvedCount = demoResponses.filter(r => r.approval_status === 'approved').length;
  const recentForms = [...forms].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 4);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Pending Review" value={pendingCount} icon={<ClipboardCheck size={22} />} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
        <StatCard label="Approved" value={approvedCount} icon={<CheckCircle2 size={22} />} gradient="linear-gradient(135deg, #10b981, #059669)" />
        <StatCard label="Total Forms" value={forms.length} icon={<FileText size={22} />} gradient="linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))" />
        <StatCard label="Projects" value={projects.length} icon={<FolderOpen size={22} />} gradient="linear-gradient(135deg, #3b82f6, #2563eb)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>Recent Forms</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/forms')}>View all <ArrowRight size={14} /></button>
          </div>
          {recentForms.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <FileText size={32} style={{ color: 'var(--color-surface-300)', margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-surface-400)' }}>No forms yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentForms.map(f => <RecentFormCard key={f.id} form={f} />)}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Review Queue', icon: <ClipboardCheck size={20} />, path: '/app/review', color: '#f59e0b' },
              { label: 'New Form', icon: <FileText size={20} />, path: '/app/forms/new/builder', color: 'var(--color-primary-500)' },
              { label: 'New Project', icon: <FolderOpen size={20} />, path: '/app/projects', color: 'var(--color-accent-500)' },
              { label: 'Manage Team', icon: <Users size={20} />, path: '/app/team', color: 'var(--color-info)' },
            ].map(a => (
              <div key={a.label} className="card card-interactive" style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(a.path)}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem', color: a.color }}>{a.icon}</div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-surface-700)' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Admin Dashboard (Read-Only) ----
function AdminDashboard() {
  const navigate = useNavigate();
  const { data: forms = [] } = useForms();
  useProjects(); // used for org-level stats

  const totalResponses = demoResponses.length;
  const approvedCount = demoResponses.filter(r => r.approval_status === 'approved').length;
  const pendingCount = demoResponses.filter(r => r.approval_status === 'pending').length;
  const approvalRate = totalResponses > 0 ? Math.round((approvedCount / totalResponses) * 100) : 0;
  const publishedCount = forms.filter(f => f.status === 'published').length;

  return (
    <>
      {/* Read-only banner */}
      <div style={{
        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
        background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.8125rem', color: 'var(--color-primary-700)',
      }}>
        <Eye size={16} />
        <span><strong>Admin View</strong> — You have read-only access to all analytics, reports, and approved data.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Responses" value={formatCompactNumber(totalResponses)} icon={<BarChart3 size={22} />} gradient="linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))" />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} change={`${approvedCount} approved`} icon={<CheckCircle2 size={22} />} gradient="linear-gradient(135deg, #10b981, #059669)" />
        <StatCard label="Active Forms" value={publishedCount} icon={<Activity size={22} />} gradient="linear-gradient(135deg, var(--color-accent-500), var(--color-accent-700))" />
        <StatCard label="Pending Review" value={pendingCount} icon={<AlertCircle size={22} />} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Data Summary</h3>
          <div className="card" style={{ padding: '1.5rem' }}>
            {/* Approval breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-surface-500)' }}>Approval Progress</span>
                <span style={{ color: 'var(--color-surface-700)', fontWeight: 600 }}>{approvalRate}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-100)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #059669)', width: `${approvalRate}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Approved', count: approvedCount, color: '#10b981' },
                { label: 'Pending', count: pendingCount, color: '#f59e0b' },
                { label: 'Rejected', count: demoResponses.filter(r => r.approval_status === 'rejected').length, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.count}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'View Forms', icon: <FileText size={20} />, path: '/app/forms', color: 'var(--color-primary-500)' },
              { label: 'View Projects', icon: <FolderOpen size={20} />, path: '/app/projects', color: 'var(--color-accent-500)' },
              { label: 'Team Members', icon: <Users size={20} />, path: '/app/team', color: 'var(--color-info)' },
              { label: 'Audit Log', icon: <Shield size={20} />, path: '/app/audit-log', color: '#6366f1' },
            ].map(a => (
              <div key={a.label} className="card card-interactive" style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(a.path)}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem', color: a.color }}>{a.icon}</div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-surface-700)' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const userRole = user?.role?.role || 'field_officer';


  const roleIcon = userRole === 'admin' ? <Shield size={18} style={{ color: '#6366f1' }} />
    : userRole === 'editor' ? <Edit3 size={18} style={{ color: '#10b981' }} />
    : <MapPin size={18} style={{ color: '#f59e0b' }} />;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.profile?.full_name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {roleIcon} {formatRole(userRole)} • {user?.organisation?.name}
          </p>
        </div>
        {userRole === 'editor' && (
          <button className="btn btn-primary" onClick={() => navigate('/app/forms/new/builder')} id="create-form-button">
            <Plus size={18} /> Create Form
          </button>
        )}
      </div>

      {userRole === 'field_officer' && <FieldOfficerDashboard />}
      {userRole === 'editor' && <EditorDashboard />}
      {(userRole === 'admin' || userRole === 'superadmin') && <AdminDashboard />}
    </div>
  );
}
