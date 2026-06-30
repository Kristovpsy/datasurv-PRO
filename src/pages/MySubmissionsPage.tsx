/**
 * My Submissions Page — Field Officer View
 * --------------------------
 * Shows all responses submitted by the logged-in field officer.
 * Displays approval status: Pending, Approved, Rejected.
 * Rejected submissions show editor feedback.
 */

import { useState, useMemo } from 'react';
import {
  Send, Clock, CheckCircle2, XCircle, AlertCircle,
  Eye, ChevronDown, ChevronUp, FileText, MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { demoResponses, demoForms } from '@/services/demoData';
import { formatRelativeTime } from '@/lib/utils';
import type { Response as FormResponse, ApprovalStatus } from '@/types';

const statusConfig: Record<ApprovalStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Review', color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={14} /> },
  approved: { label: 'Approved', color: '#10b981', bg: '#d1fae5', icon: <CheckCircle2 size={14} /> },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={14} /> },
};

function SubmissionCard({ response }: { response: FormResponse }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[response.approval_status];
  const form = demoForms.find(f => f.id === response.form_id);

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        border: response.approval_status === 'rejected' ? '1px solid #fecaca' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.25rem', cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: sc.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: sc.color, flexShrink: 0,
        }}>
          {sc.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>
              {form?.title || 'Unknown Form'}
            </span>
            <span className="badge" style={{ background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem' }}>
              {sc.icon} {sc.label}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', display: 'flex', gap: '0.75rem' }}>
            <span>Submitted {formatRelativeTime(response.submitted_at)}</span>
            <span>•</span>
            <span>{response.id}</span>
            {response.metadata?.device && (
              <>
                <span>•</span>
                <span>{response.metadata.device === 'mobile' ? '📱 Mobile' : '💻 Desktop'}</span>
              </>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: 'var(--color-surface-400)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-surface-400)' }} />}
      </div>

      {expanded && (
        <div className="animate-fade-in" style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid var(--color-surface-100)',
          paddingTop: '1rem',
        }}>
          {/* Editor Feedback (for rejected) */}
          {response.approval_status === 'rejected' && response.editor_notes && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: '#fee2e2', border: '1px solid #fecaca',
              marginBottom: '1rem', fontSize: '0.8125rem', color: '#991b1b',
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            }}>
              <MessageSquare size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontWeight: 600 }}>Editor Feedback: </span>
                {response.editor_notes}
              </div>
            </div>
          )}

          {/* Approval info */}
          {response.approval_status === 'approved' && response.editor_notes && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: '#d1fae5', border: '1px solid #a7f3d0',
              marginBottom: '1rem', fontSize: '0.8125rem', color: '#065f46',
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontWeight: 600 }}>Editor Note: </span>
                {response.editor_notes}
              </div>
            </div>
          )}

          {/* Answers Preview */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-surface-700)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Eye size={14} /> Submitted Data
            </h4>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
              padding: '0.75rem', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-50)',
            }}>
              {Object.entries(response.answers).slice(0, 10).map(([key, value]) => (
                <div key={key} style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-surface-400)' }}>{key.slice(0, 8)}…: </span>
                  <span style={{ color: 'var(--color-surface-700)', fontWeight: 500 }}>
                    {typeof value === 'object' ? JSON.stringify(value).slice(0, 40) : String(value).slice(0, 40)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timing */}
          {response.approved_at && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)', marginTop: '0.75rem' }}>
              {response.approval_status === 'approved' ? 'Approved' : 'Reviewed'} {formatRelativeTime(response.approved_at)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MySubmissionsPage() {
  const { user } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');

  // In demo mode, show all responses (they're all "from" the officer)
  const allSubmissions = useMemo(() => {
    return demoResponses
      .filter(r => r.respondent_id === user?.id || user?.role?.role === 'field_officer')
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }, [user]);

  const filteredSubmissions = useMemo(() => {
    if (filterStatus === 'all') return allSubmissions;
    return allSubmissions.filter(r => r.approval_status === filterStatus);
  }, [allSubmissions, filterStatus]);

  const pendingCount = allSubmissions.filter(r => r.approval_status === 'pending').length;
  const approvedCount = allSubmissions.filter(r => r.approval_status === 'approved').length;
  const rejectedCount = allSubmissions.filter(r => r.approval_status === 'rejected').length;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={24} style={{ color: 'var(--color-primary-500)' }} />
          My Submissions
        </h1>
        <p className="page-subtitle">Track the status of all your submitted data. Rejected submissions include editor feedback.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', count: allSubmissions.length, color: 'var(--color-primary-500)', bg: 'var(--color-primary-100)', icon: <FileText size={18} /> },
          { label: 'Pending', count: pendingCount, color: '#f59e0b', bg: '#fef3c7', icon: <AlertCircle size={18} /> },
          { label: 'Approved', count: approvedCount, color: '#10b981', bg: '#d1fae5', icon: <CheckCircle2 size={18} /> },
          { label: 'Rejected', count: rejectedCount, color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={18} /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-surface-900)', lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-500)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-surface-100)', borderRadius: 'var(--radius-md)', padding: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
        {([
          { key: 'all', label: 'All' },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'approved', label: `Approved (${approvedCount})` },
          { key: 'rejected', label: `Rejected (${rejectedCount})` },
        ] as { key: ApprovalStatus | 'all'; label: string }[]).map(f => (
          <button
            key={f.key}
            className="btn btn-sm"
            style={{
              background: filterStatus === f.key ? 'var(--color-surface-0)' : 'transparent',
              color: filterStatus === f.key ? 'var(--color-primary-600)' : 'var(--color-surface-500)',
              fontWeight: filterStatus === f.key ? 600 : 400,
              boxShadow: filterStatus === f.key ? 'var(--shadow-sm)' : 'none',
              border: 'none', fontSize: '0.75rem',
            }}
            onClick={() => setFilterStatus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredSubmissions.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Send size={48} style={{ color: 'var(--color-surface-300)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-600)' }}>No submissions yet</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-400)', marginTop: '0.25rem' }}>
              Your submitted data will appear here with their review status.
            </p>
          </div>
        ) : (
          filteredSubmissions.slice(0, 50).map(response => (
            <SubmissionCard key={response.id} response={response} />
          ))
        )}
      </div>

      {filteredSubmissions.length > 50 && (
        <p style={{ textAlign: 'center', color: 'var(--color-surface-400)', fontSize: '0.8125rem', marginTop: '1rem' }}>
          Showing 50 of {filteredSubmissions.length} submissions
        </p>
      )}
    </div>
  );
}
