/**
 * Forms List Page
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Plus, Search, Clock, BarChart3, Share2, Eye, Loader2 } from 'lucide-react';
import { useForms, useProjects } from '@/hooks';
import { formatRelativeTime } from '@/lib/utils';
import type { FormStatus } from '@/types';

const statusConfig: Record<FormStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'var(--color-surface-100)', text: 'var(--color-surface-600)', label: 'Draft' },
  published: { bg: 'var(--color-accent-100)', text: 'var(--color-accent-700)', label: 'Published' },
  closed: { bg: '#fee2e2', text: '#991b1b', label: 'Closed' },
  archived: { bg: '#fef3c7', text: '#92400e', label: 'Archived' },
};

export function FormListPage() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'all'>('all');

  const { data: projects = [] } = useProjects();
  const { data: allForms = [], isLoading } = useForms(projectId);

  const project = projectId ? projects.find(p => p.id === projectId) : null;

  let forms = allForms;
  if (searchQuery) forms = forms.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));
  if (statusFilter !== 'all') forms = forms.filter(f => f.status === statusFilter);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">{project ? project.name : 'All Forms'}</h1>
          <p className="page-subtitle">{project ? project.description : 'Manage all your research forms across projects.'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/forms/new/builder')} id="create-form-btn">
          <Plus size={18} /> Create Form
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-surface-400)' }} />
          <input type="text" className="input" placeholder="Search forms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', height: 38, fontSize: '0.8125rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['all', 'draft', 'published', 'closed', 'archived'] as const).map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)} style={{ textTransform: 'capitalize' }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--color-surface-400)' }}>
          <Loader2 size={20} className="animate-spin" />
          <span>Loading forms...</span>
        </div>
      ) : forms.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">{searchQuery || statusFilter !== 'all' ? 'No forms match your filters' : 'No forms yet'}</h3>
          <p className="empty-state-text">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first form to start collecting data.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button className="btn btn-primary" onClick={() => navigate('/app/forms/new/builder')}>
              <Plus size={18} /> Create Form
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {forms.map(form => {
            const sc = statusConfig[form.status];
            return (
              <div key={form.id} className="card card-interactive" style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => navigate(`/app/forms/${form.id}/builder`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '0.25rem' }}>{form.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-500)' }}>{form.description || 'No description'}</p>
                  </div>
                  <span className="badge" style={{ background: sc.bg, color: sc.text, marginLeft: '0.75rem', flexShrink: 0 }}>{sc.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-surface-100)', fontSize: '0.75rem', color: 'var(--color-surface-400)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} />{formatRelativeTime(form.updated_at)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BarChart3 size={12} />v{form.current_version}</span>
                  {form.public_id && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Share2 size={12} />Shared</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/app/forms/${form.id}/analytics`); }}>
                    <BarChart3 size={14} /> Analytics
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/app/forms/${form.id}/distribute`); }}>
                    <Share2 size={14} /> Share
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/app/forms/${form.id}/responses`); }}>
                    <Eye size={14} /> Responses
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
