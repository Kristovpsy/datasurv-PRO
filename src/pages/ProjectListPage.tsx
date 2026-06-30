/**
 * Projects List Page
 */
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, FileText, BarChart3, Loader2 } from 'lucide-react';
import { useProjects, useForms } from '@/hooks';
import { formatDate } from '@/lib/utils';

export function ProjectListPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: forms = [], isLoading: formsLoading } = useForms();
  const isLoading = projectsLoading || formsLoading;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your research initiatives and group related forms.</p>
        </div>
        <button className="btn btn-primary" id="create-project-button"><Plus size={18} /> New Project</button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--color-surface-400)' }}>
          <Loader2 size={20} className="animate-spin" />
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-text">Create your first project to organise your forms and research initiatives.</p>
          <button className="btn btn-primary" id="create-project-empty-button"><Plus size={18} /> New Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {projects.map((project) => {
            const projectForms = forms.filter(f => f.project_id === project.id);
            const publishedCount = projectForms.filter(f => f.status === 'published').length;
            return (
              <div key={project.id} className="card card-interactive" style={{ padding: '1.5rem', cursor: 'pointer' }}
                onClick={() => navigate(`/app/projects/${project.id}/forms`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary-600)', flexShrink: 0,
                  }}><FolderOpen size={22} /></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '0.25rem' }}>{project.name}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-500)', lineHeight: 1.5 }}>{project.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-100)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-surface-500)' }}>
                    <FileText size={14} /> {projectForms.length} forms
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-accent-600)' }}>
                    <BarChart3 size={14} /> {publishedCount} active
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-surface-400)' }}>
                    Updated {formatDate(project.updated_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
