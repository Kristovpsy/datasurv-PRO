/**
 * Form Responses Page
 * --------------------------
 * Shows all responses for a form with approval status column.
 * Admin: read-only (no edit/delete).
 * Editor: can see approval status, use review queue for actions.
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, CheckCircle, XCircle, Loader2, Clock, CheckCircle2, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { useForm, useCurrentVersion, useResponses } from '@/hooks';
import { useAuthStore } from '@/stores';
import { exportToCSV, exportToExcel } from '@/services/exportService';
import { formatDate } from '@/lib/utils';
import type { ApprovalStatus } from '@/types';

const approvalColors: Record<ApprovalStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: '#fef3c7', text: '#f59e0b', icon: <Clock size={12} /> },
  approved: { bg: '#d1fae5', text: '#10b981', icon: <CheckCircle2 size={12} /> },
  rejected: { bg: '#fee2e2', text: '#ef4444', icon: <XCircle size={12} /> },
};

export function FormResponsesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadOnly, canDelete } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterApproval, setFilterApproval] = useState<ApprovalStatus | 'all'>('all');

  const { data: form, isLoading: formLoading } = useForm(id || '');
  const { data: version, isLoading: versionLoading } = useCurrentVersion(id || '');
  const { data: responses = [], isLoading: responsesLoading } = useResponses(id || '');

  const isLoading = formLoading || versionLoading || responsesLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--color-surface-400)' }}>
        <Loader2 size={20} className="animate-spin" />
        <span>Loading responses...</span>
      </div>
    );
  }

  if (!form) return <div className="page-container"><p>Form not found.</p></div>;

  const fields = version?.schema.fields.filter(f => f.type !== 'section_header').slice(0, 4) || [];
  const allFields = version?.schema.fields || [];

  const filteredResponses = responses.filter(r => {
    if (filterApproval !== 'all' && r.approval_status !== filterApproval) return false;
    return true;
  });

  const pendingCount = responses.filter(r => r.approval_status === 'pending').length;
  const approvedCount = responses.filter(r => r.approval_status === 'approved').length;
  const rejectedCount = responses.filter(r => r.approval_status === 'rejected').length;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">Responses</h1>
            <p className="page-subtitle">{form.title} • {responses.length} responses</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(allFields, responses, form.title.replace(/[^a-zA-Z0-9]/g, '_'))}><Download size={16} /> Export CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToExcel(allFields, responses, form.title.replace(/[^a-zA-Z0-9]/g, '_'))}><Download size={16} /> Export Excel</button>
        </div>
      </div>

      {/* Admin read-only banner */}
      {isReadOnly && (
        <div style={{
          padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.8125rem', color: 'var(--color-primary-700)',
        }}>
          <Eye size={14} /> Read-only view — data editing is handled by editors.
        </div>
      )}

      {/* Approval Status Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-surface-400)' }} />
          <input className="input" placeholder="Search responses..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.5rem', height: 38, fontSize: '0.8125rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-surface-100)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
          {[
            { key: 'all' as const, label: `All (${responses.length})` },
            { key: 'pending' as const, label: `Pending (${pendingCount})` },
            { key: 'approved' as const, label: `Approved (${approvedCount})` },
            { key: 'rejected' as const, label: `Rejected (${rejectedCount})` },
          ].map(f => (
            <button
              key={f.key}
              className="btn btn-sm"
              style={{
                background: filterApproval === f.key ? 'var(--color-surface-0)' : 'transparent',
                color: filterApproval === f.key ? 'var(--color-primary-600)' : 'var(--color-surface-500)',
                fontWeight: filterApproval === f.key ? 600 : 400,
                boxShadow: filterApproval === f.key ? 'var(--shadow-sm)' : 'none',
                border: 'none', fontSize: '0.6875rem',
              }}
              onClick={() => setFilterApproval(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Response Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-50)', borderBottom: '1px solid var(--color-surface-200)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>#</th>
                {fields.map(f => (
                  <th key={f.id} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)', whiteSpace: 'nowrap' }}>{f.label}</th>
                ))}
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Approval</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-600)' }}>Submitted</th>
                {canDelete && <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-surface-600)' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredResponses.slice(0, 20).map((resp, i) => {
                const ac = approvalColors[resp.approval_status];
                return (
                  <tr key={resp.id} style={{ borderBottom: '1px solid var(--color-surface-100)', transition: 'background var(--transition-fast)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-surface-400)' }}>{i + 1}</td>
                    {fields.map(f => {
                      const ans = (resp.answers as Record<string, unknown>)[f.id];
                      const display = Array.isArray(ans) ? ans.join(', ') : typeof ans === 'object' ? JSON.stringify(ans) : String(ans ?? '—');
                      return <td key={f.id} style={{ padding: '0.75rem 1rem', color: 'var(--color-surface-700)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{display}</td>;
                    })}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge" style={{ background: ac.bg, color: ac.text, display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content', fontSize: '0.6875rem' }}>
                        {ac.icon} {resp.approval_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {resp.is_complete
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)' }}><CheckCircle size={14} /> Complete</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-surface-400)' }}><AlertCircle size={14} /> Partial</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-surface-500)', whiteSpace: 'nowrap' }}>{formatDate(resp.submitted_at)}</td>
                    {canDelete && (
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Delete response" style={{ color: 'var(--color-danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-surface-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--color-surface-500)' }}>
          <span>Showing 1-{Math.min(20, filteredResponses.length)} of {filteredResponses.length}</span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button className="btn btn-ghost btn-sm" disabled>Previous</button>
            <button className="btn btn-ghost btn-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
