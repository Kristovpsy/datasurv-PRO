/**
 * Form Distribution Page — QR Code & Share Links
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Download, Link, QrCode, Code, Check, Globe, Calendar, Hash, Loader2 } from 'lucide-react';
import { useForm } from '@/hooks';
import { useUIStore } from '@/stores';

export function FormDistributePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed'>('link');

  const { data: form, isLoading } = useForm(id || '');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--color-surface-400)' }}>
        <Loader2 size={20} className="animate-spin" />
        <span>Loading form...</span>
      </div>
    );
  }

  if (!form) return <div className="page-container"><p>Form not found.</p></div>;

  const shareUrl = `${window.location.origin}/r/${form.public_id || 'preview'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addNotification({ type: 'success', message: 'Link copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: 'link' as const, label: 'Share Link', icon: <Link size={16} /> },
    { key: 'qr' as const, label: 'QR Code', icon: <QrCode size={16} /> },
    { key: 'embed' as const, label: 'Embed', icon: <Code size={16} /> },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="page-title">Distribute Form</h1>
          <p className="page-subtitle">{form.title}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
        {/* Main Content */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--color-surface-100)', borderRadius: 'var(--radius-lg)', padding: '0.25rem' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="btn" style={{
                  flex: 1, background: activeTab === tab.key ? 'var(--color-surface-0)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-surface-500)',
                  boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Direct Share Link</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input className="input" value={shareUrl} readOnly style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }} />
                <button className="btn btn-primary" onClick={handleCopy} style={{ flexShrink: 0 }}>
                  {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
                </button>
              </div>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-50)', border: '1px solid var(--color-surface-200)' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-600)' }}>Share this link directly with respondents via messaging apps, email, or social media. Anyone with the link can access the form.</p>
              </div>
            </div>
          )}

          {/* QR Tab */}
          {activeTab === 'qr' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>QR Code</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem 0' }}>
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-200)', boxShadow: 'var(--shadow-lg)' }}>
                  <QRCodeSVG value={shareUrl} size={220} level="H" includeMargin={false}
                    fgColor="#0f172a" bgColor="#ffffff" />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-500)', textAlign: 'center', maxWidth: 320 }}>
                  Scan this QR code to open the form. Print it on flyers, posters, or ID cards for easy field distribution.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm"><Download size={16} /> Download PNG</button>
                  <button className="btn btn-secondary btn-sm"><Download size={16} /> Download SVG</button>
                </div>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === 'embed' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1rem' }}>Embed Code</h3>
              <div style={{ marginBottom: '1rem' }}>
                <textarea className="input" readOnly rows={4}
                  value={`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`}
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem', resize: 'none' }} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => {
                navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`);
                addNotification({ type: 'success', message: 'Embed code copied!' });
              }}><Copy size={16} /> Copy Embed Code</button>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '1.25rem' }}>Share Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Globe size={14} style={{ color: 'var(--color-surface-500)' }} />
                  <span className="label" style={{ margin: 0 }}>Access</span>
                </div>
                <select className="input" style={{ fontSize: '0.8125rem' }}>
                  <option>Anyone with link</option>
                  <option>Password protected</option>
                  <option>Authenticated users only</option>
                </select>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar size={14} style={{ color: 'var(--color-surface-500)' }} />
                  <span className="label" style={{ margin: 0 }}>Deadline</span>
                </div>
                <input className="input" type="datetime-local" style={{ fontSize: '0.8125rem' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Hash size={14} style={{ color: 'var(--color-surface-500)' }} />
                  <span className="label" style={{ margin: 0 }}>Max Responses</span>
                </div>
                <input className="input" type="number" placeholder="Unlimited" style={{ fontSize: '0.8125rem' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-surface-700)' }}>Allow anonymous submissions</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)' }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-surface-700)' }}>Allow multiple submissions</span>
                </label>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: form.status === 'published' ? 'var(--color-success)' : 'var(--color-surface-400)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-surface-700)' }}>
                {form.status === 'published' ? 'Form is live' : 'Form is not published'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-500)' }}>
              {form.status === 'published' ? 'Respondents can access this form via the share link or QR code.' : 'Publish this form to start collecting responses.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
