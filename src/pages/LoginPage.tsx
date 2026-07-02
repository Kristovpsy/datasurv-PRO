/**
 * Login Page
 * --------------------------
 * Email + password authentication with demo account quick-login buttons.
 *
 * Demo Accounts:
 *   🟣 Admin       — admin@datasurv.io   / Admin@2025!
 *   🔵 Data Editor — editor@datasurv.io  / Editor@2025!
 *   🟢 Field Officer — officer@datasurv.io / Field@2025!
 */

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Zap, ArrowRight, Shield, Edit3, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { DEMO_ACCOUNTS } from '@/stores/authStore';
import { loginSchema, type LoginFormData } from '@/schemas/form.schema';

export function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/app/dashboard');
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    clearError();
    setValue('email', email);
    setValue('password', password);
    const success = await login(email, password);
    if (success) {
      navigate('/app/dashboard');
    }
  };

  const demoRoleConfig = [
    {
      account: DEMO_ACCOUNTS.find(a => a.role === 'admin')!,
      icon: <Shield size={18} />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      description: 'View analytics & reports (read-only)',
    },
    {
      account: DEMO_ACCOUNTS.find(a => a.role === 'editor')!,
      icon: <Edit3 size={18} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      description: 'Review, edit & approve submissions',
    },
    {
      account: DEMO_ACCOUNTS.find(a => a.role === 'field_officer')!,
      icon: <MapPin size={18} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      description: 'Collect & submit field data',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left Panel — Branding */}
      <div
        className="gradient-hero"
        style={{
          flex: '0 0 45%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Circles */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          filter: 'blur(60px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={28} color="white" />
            </div>
            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Datasurv Pro
            </span>
          </div>

          <h1 style={{
            color: 'white',
            fontSize: '2.75rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}>
            Field Research,<br />
            <span style={{ color: 'var(--color-accent-400)' }}>Reimagined.</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            maxWidth: 440,
          }}>
            Build powerful forms, collect data from the field, and unlock instant analytics — all from one platform designed for research teams.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem' }}>
            {['Drag & Drop Builder', 'Offline First', 'QR Distribution', 'Real-time Analytics'].map((feat) => (
              <span
                key={feat}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--color-surface-0)',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in">
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-surface-900)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--color-surface-500)',
            marginBottom: '2rem',
          }}>
            Sign in to your Datasurv account
          </p>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.8125rem',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                {...register('email')}
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                id="email"
                autoComplete="email"
              />
              {errors.email && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  id="password"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-surface-400)',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isLoading}
              id="login-submit"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin" style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-surface-200)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Demo Accounts
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-surface-200)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {demoRoleConfig.map(({ account, icon, gradient, description }) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={isLoading}
                  id={`demo-login-${account.role}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-surface-200)',
                    background: 'var(--color-surface-0)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-surface-200)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: gradient, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>
                      {account.full_name}
                      <span style={{
                        marginLeft: '0.5rem', fontSize: '0.6875rem', fontWeight: 500,
                        padding: '0.125rem 0.5rem', borderRadius: '9999px',
                        background: `${gradient.includes('6366f1') ? '#6366f115' : gradient.includes('10b981') ? '#10b98115' : '#f59e0b15'}`,
                        color: gradient.includes('6366f1') ? '#6366f1' : gradient.includes('10b981') ? '#10b981' : '#f59e0b',
                      }}>
                        {account.role === 'admin' ? 'Admin' : account.role === 'editor' ? 'Data Editor' : 'Field Officer'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)', marginTop: '0.125rem' }}>
                      {description}
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--color-surface-300)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
