/**
 * Landing Page — Public marketing page
 */
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, BarChart3, QrCode, Wifi, Shield, Users } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: <Zap size={24} />, title: 'Drag & Drop Builder', desc: 'Create powerful forms in minutes with 12+ field types and conditional logic.' },
    { icon: <QrCode size={24} />, title: 'QR Distribution', desc: 'Generate QR codes for frictionless field data collection. No app needed.' },
    { icon: <BarChart3 size={24} />, title: 'Instant Analytics', desc: 'Real-time dashboards with per-field visualisations and export.' },
    { icon: <Wifi size={24} />, title: 'Offline First', desc: 'Collect data without internet. Responses sync when connectivity returns.' },
    { icon: <Shield size={24} />, title: 'Enterprise Security', desc: 'Row-level security, role-based access, and complete audit trails.' },
    { icon: <Users size={24} />, title: 'Team Management', desc: 'Four-tier RBAC from Field Officer to Super Admin.' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-surface-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Zap size={18} color="white" /></div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-surface-900)' }}>Datasurv Pro</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/auth/login')}>Sign in</button>
          <button className="btn btn-primary" onClick={() => navigate('/auth/login')}>Get Started <ArrowRight size={16} /></button>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero" style={{
        padding: '10rem 2rem 6rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '10%', width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(100px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(80px)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="badge" style={{
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
            padding: '0.375rem 1rem', fontSize: '0.8125rem', marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>✨ Built for field research teams</div>
          <h1 style={{
            color: 'white', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-0.03em', marginBottom: '1.5rem',
          }}>
            Collect field data.<br />
            <span className="gradient-text">Analyse instantly.</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: '1.1875rem', lineHeight: 1.6,
            maxWidth: 560, margin: '0 auto 2.5rem',
          }}>
            Build powerful forms, distribute via QR codes, and unlock real-time analytics — all from one platform designed for researchers working in the field.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth/login')} style={{
              padding: '0.875rem 2rem', fontSize: '1rem',
            }}>Start Building Forms <ArrowRight size={18} /></button>
            <button className="btn btn-lg" onClick={() => navigate('/auth/login')} style={{
              background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.875rem 2rem', fontSize: '1rem',
            }}>View Demo</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 2rem', background: 'var(--color-surface-0)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-surface-900)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Everything you need for field research
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--color-surface-500)', maxWidth: 520, margin: '0 auto' }}>
              From form creation to data analysis — one platform, no compromises.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem', color: 'var(--color-primary-600)',
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-surface-800)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-surface-500)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', background: 'var(--color-surface-50)' }}>
        <div style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          padding: '3.5rem', borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to transform your field research?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2rem', maxWidth: 440, margin: '0 auto 2rem' }}>
            Join research teams already using Datasurv Pro to collect and analyse data from the field.
          </p>
          <button className="btn btn-lg" onClick={() => navigate('/auth/login')} style={{
            background: 'white', color: 'var(--color-primary-700)', fontWeight: 600, padding: '0.875rem 2rem',
          }}>Get Started Free <ArrowRight size={18} /></button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--color-surface-200)',
        fontSize: '0.8125rem', color: 'var(--color-surface-400)', background: 'var(--color-surface-0)',
      }}>
        © 2025 Datasurv Pro. Built for field researchers, by researchers.
      </footer>
    </div>
  );
}
