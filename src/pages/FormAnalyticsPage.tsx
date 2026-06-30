/**
 * Form Analytics Page — Per-field visualisations
 */
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ArrowLeft, Download, RefreshCw, Users, Clock, CheckCircle, TrendingUp, Loader2, FileText, BarChart3 as BarChart3Icon } from 'lucide-react';
import { useFormAnalytics } from '@/hooks';
import { exportToCSV, exportAnalyticsSummary } from '@/services/exportService';
import { formatCompactNumber } from '@/lib/utils';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function StatMini({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-500)' }}>{label}</p>
          <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-surface-900)', lineHeight: 1 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>{title}</h4>
      {children}
    </div>
  );
}

export function FormAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: analytics, isLoading, refetch } = useFormAnalytics(id || '');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--color-surface-400)' }}>
        <Loader2 size={20} className="animate-spin" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <FileText size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">No analytics available</h3>
        <p className="empty-state-text">This form has no responses yet, or the form could not be found.</p>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Go back</button>
      </div>
    );
  }

  const { form, version, responses, totalResponses, completedResponses, avgTime, completionRate, timeline, fieldAnalytics } = analytics;

  // Per-field chart data
  const genderAnalytics = fieldAnalytics.find(fa => fa.field.label.includes('Gender'));
  const healthAnalytics = fieldAnalytics.find(fa => fa.field.label.includes('overall health'));
  const ratingAnalytics = fieldAnalytics.find(fa => fa.field.type === 'rating');

  const ratingData = ratingAnalytics?.type === 'bar'
    ? ratingAnalytics.data.map(d => ({ rating: `${d.name} ★`, count: d.value }))
    : [];

  // Device breakdown from metadata
  const mobileCount = responses.filter(r => r.metadata?.device === 'mobile').length;
  const desktopCount = responses.filter(r => r.metadata?.device === 'desktop').length;
  const deviceData = [
    { name: 'Mobile', value: mobileCount },
    { name: 'Desktop', value: desktopCount },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">{form.title}</h1>
            <p className="page-subtitle">Analytics Dashboard • {totalResponses} responses</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()}><RefreshCw size={16} /> Refresh</button>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            exportAnalyticsSummary(form.title, {
              totalResponses,
              completedResponses,
              completionRate,
              avgTime,
              fieldAnalytics: fieldAnalytics.filter(fa => fa.type === 'pie' || fa.type === 'bar') as Parameters<typeof exportAnalyticsSummary>[1]['fieldAnalytics'],
            });
          }}><Download size={16} /> Export Report</button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(version?.schema.fields || [], responses, form.title.replace(/[^a-zA-Z0-9]/g, '_'))}><Download size={16} /> Export CSV</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatMini label="Total Responses" value={formatCompactNumber(totalResponses)} icon={<Users size={18} />} color="var(--color-primary-500)" />
        <StatMini label="Completion Rate" value={`${completionRate}%`} icon={<CheckCircle size={18} />} color="var(--color-accent-500)" />
        <StatMini label="Avg. Time" value={`${Math.floor(avgTime / 60)}m ${avgTime % 60}s`} icon={<Clock size={18} />} color="var(--color-info)" />
        <StatMini label="Today" value={responses.filter(r => new Date(r.submitted_at).toDateString() === new Date().toDateString()).length} icon={<TrendingUp size={18} />} color="#f59e0b" />
      </div>

      {totalResponses === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BarChart3Icon size={48} style={{ color: 'var(--color-surface-300)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-surface-700)', marginBottom: '0.5rem' }}>No responses yet</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-surface-400)' }}>Share your form to start collecting data. Charts will appear here once responses come in.</p>
        </div>
      ) : (
        /* Charts Grid */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Response Timeline */}
          <ChartCard title="Response Timeline">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="responses" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Gender Distribution */}
          {genderAnalytics && genderAnalytics.type === 'pie' && genderAnalytics.data.length > 0 && (
            <ChartCard title="Gender Distribution">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={genderAnalytics.data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {genderAnalytics.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Health Rating */}
          {healthAnalytics && healthAnalytics.type === 'bar' && healthAnalytics.data.length > 0 && (
            <ChartCard title="Overall Health Rating">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={healthAnalytics.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {healthAnalytics.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Satisfaction Rating */}
          {ratingData.length > 0 && (
            <ChartCard title="Satisfaction Rating">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                  <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Device Breakdown */}
          {(mobileCount > 0 || desktopCount > 0) && (
            <ChartCard title="Device Breakdown">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill="#6366f1" /><Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}
