/**
 * Review Queue Page — Editor Only
 * --------------------------
 * Shows all pending submissions awaiting editor review/approval.
 * Editors can approve, reject, or edit & approve each submission.
 */

import { useState, useMemo } from 'react';
import {
  ClipboardCheck, Check, X, Eye, MessageSquare,
  Search, ChevronDown, ChevronUp, Clock,
  CheckCircle2, XCircle, AlertCircle, User,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { demoResponses, demoForms } from '@/services/demoData';
import { formatRelativeTime } from '@/lib/utils';
import type { Response as FormResponse, ApprovalStatus } from '@/types';

const statusConfig: Record<ApprovalStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={14} /> },
  approved: { label: 'Approved', color: '#10b981', bg: '#d1fae5', icon: <CheckCircle2 size={14} /> },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={14} /> },
};

function ResponseReviewCard({
  response,
  onApprove,
  onReject,
  formTitle,
}: {
  response: FormResponse;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, notes: string) => void;
  formTitle: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(response.editor_notes || '');
  const sc = statusConfig[response.approval_status];

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        transition: 'all 0.2s',
        border: response.approval_status === 'pending' ? '1px solid #fde68a' : undefined,
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.25rem', cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary-100)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--color-primary-600)', flexShrink: 0,
        }}>
          <User size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>
              {response.submitted_by_name || 'Anonymous'}
            </span>
            <span className="badge" style={{ background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {sc.icon} {sc.label}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', display: 'flex', gap: '0.75rem' }}>
            <span>{formTitle}</span>
            <span>•</span>
            <span>{formatRelativeTime(response.submitted_at)}</span>
            <span>•</span>
            <span>{response.id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {response.approval_status === 'pending' && (
            <>
              <button
                className="btn btn-sm"
                style={{ background: '#10b981', color: 'white', border: 'none' }}
                onClick={(e) => { e.stopPropagation(); onApprove(response.id, notes); }}
                title="Approve"
              >
                <Check size={14} /> Approve
              </button>
              <button
                className="btn btn-sm"
                style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
                onClick={(e) => { e.stopPropagation(); onReject(response.id, notes); }}
                title="Reject"
              >
                <X size={14} /> Reject
              </button>
            </>
          )}
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--color-surface-400)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-surface-400)' }} />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="animate-fade-in" style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid var(--color-surface-100)',
          paddingTop: '1rem',
        }}>
          {/* Answers Grid */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-surface-700)', marginBottom: '0.75rem' }}>
              <Eye size={14} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Response Data
            </h4>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
              padding: '0.75rem', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-50)',
            }}>
              {Object.entries(response.answers).slice(0, 8).map(([key, value]) => (
                <div key={key} style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-surface-400)' }}>{key.slice(0, 8)}…: </span>
                  <span style={{ color: 'var(--color-surface-700)', fontWeight: 500 }}>
                    {typeof value === 'object' ? JSON.stringify(value).slice(0, 40) : String(value).slice(0, 40)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          {response.metadata && (
            <div style={{
              display: 'flex', gap: '1rem', fontSize: '0.6875rem', color: 'var(--color-surface-400)',
              marginBottom: '1rem',
            }}>
              {response.metadata.device && <span>📱 {response.metadata.device}</span>}
              {response.metadata.browser && <span>🌐 {response.metadata.browser}</span>}
              {response.metadata.time_to_complete_seconds && <span>⏱️ {Math.round(response.metadata.time_to_complete_seconds / 60)}min</span>}
              {response.metadata.offline_submitted && <span>📡 Offline</span>}
            </div>
          )}

          {/* Editor Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-surface-600)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
              <MessageSquare size={12} /> Editor Notes
            </label>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add review notes..."
              rows={2}
              style={{ fontSize: '0.8125rem', resize: 'vertical' }}
            />
          </div>

          {/* Action Bar (for non-pending that might need re-review) */}
          {response.approval_status === 'pending' && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                className="btn btn-sm"
                style={{ background: '#10b981', color: 'white', border: 'none' }}
                onClick={() => onApprove(response.id, notes)}
              >
                <Check size={14} /> Approve
              </button>
              <button
                className="btn btn-sm"
                style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
                onClick={() => onReject(response.id, notes)}
              >
                <X size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReviewQueuePage() {
  const { user } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [responses, setResponses] = useState<FormResponse[]>(demoResponses);

  const filteredResponses = useMemo(() => {
    let result = responses;
    if (filterStatus !== 'all') {
      result = result.filter(r => r.approval_status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.submitted_by_name?.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }, [responses, filterStatus, searchQuery]);

  const pendingCount = responses.filter(r => r.approval_status === 'pending').length;
  const approvedCount = responses.filter(r => r.approval_status === 'approved').length;
  const rejectedCount = responses.filter(r => r.approval_status === 'rejected').length;

  const handleApprove = (id: string, notes: string) => {
    setResponses(prev => prev.map(r =>
      r.id === id ? { ...r, approval_status: 'approved' as ApprovalStatus, approved_by: user?.id || '', approved_at: new Date().toISOString(), editor_notes: notes || r.editor_notes } : r
    ));
  };

  const handleReject = (id: string, notes: string) => {
    setResponses(prev => prev.map(r =>
      r.id === id ? { ...r, approval_status: 'rejected' as ApprovalStatus, approved_by: user?.id || '', approved_at: new Date().toISOString(), editor_notes: notes || r.editor_notes } : r
    ));
  };

  const getFormTitle = (formId: string) => {
    return demoForms.find(f => f.id === formId)?.title || 'Unknown Form';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={24} style={{ color: 'var(--color-primary-500)' }} />
            Review Queue
          </h1>
          <p className="page-subtitle">Review and approve field submissions before they reach the admin dashboard.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending Review', count: pendingCount, color: '#f59e0b', bg: '#fef3c7', icon: <AlertCircle size={18} /> },
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-surface-400)' }} />
          <input
            className="input"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: 38, fontSize: '0.8125rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-surface-100)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
          {([
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
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
      </div>

      {/* Response List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredResponses.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <ClipboardCheck size={48} style={{ color: 'var(--color-surface-300)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-600)' }}>
              {filterStatus === 'pending' ? 'All caught up!' : 'No responses found'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-400)', marginTop: '0.25rem' }}>
              {filterStatus === 'pending'
                ? 'There are no submissions waiting for review.'
                : `No ${filterStatus === 'all' ? '' : filterStatus} responses match your search.`}
            </p>
          </div>
        ) : (
          filteredResponses.slice(0, 50).map(response => (
            <ResponseReviewCard
              key={response.id}
              response={response}
              onApprove={handleApprove}
              onReject={handleReject}
              formTitle={getFormTitle(response.form_id)}
            />
          ))
        )}
      </div>

      {filteredResponses.length > 50 && (
        <p style={{ textAlign: 'center', color: 'var(--color-surface-400)', fontSize: '0.8125rem', marginTop: '1rem' }}>
          Showing 50 of {filteredResponses.length} responses
        </p>
      )}
    </div>
  );
}
