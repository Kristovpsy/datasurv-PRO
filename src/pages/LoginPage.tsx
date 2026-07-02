/**
 * Login Page
 * --------------------------
 * Email + password sign-in.
 * New users should use the Register page at /auth/register.
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { loginSchema, type LoginFormData } from '@/schemas/form.schema';

export function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
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

          {/* Register link */}
          <p style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-surface-500)',
          }}>
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              style={{
                color: 'var(--color-primary-600)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
