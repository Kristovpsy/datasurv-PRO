/**
 * Register Page
 * --------------------------
 * Self-registration flow for all three roles:
 *   - Admin:         requires hardcoded secret passphrase (ADMINONLY@2025)
 *   - Editor:        open registration with full name + credentials
 *   - Field Officer: open registration with full name + credentials
 *
 * On success → redirects to /auth/login with a success banner.
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, Zap, ArrowRight, Shield, Edit3, MapPin,
  CheckCircle2, Lock,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { registerSchema, type RegisterFormData } from '@/schemas/form.schema';

type RoleOption = 'admin' | 'editor' | 'field_officer';

const ROLE_CONFIG: Record<RoleOption, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge: string;
}> = {
  admin: {
    label: 'Admin',
    description: 'Manage the organisation, analytics & settings',
    icon: <Shield size={22} />,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    badge: 'Requires secret key',
  },
  editor: {
    label: 'Data Editor',
    description: 'Review, edit and approve field submissions',
    icon: <Edit3 size={22} />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    badge: 'Open registration',
  },
  field_officer: {
    label: 'Field Officer',
    description: 'Collect and submit data from the field',
    icon: <MapPin size={22} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    badge: 'Open registration',
  },
};

export function RegisterPage() {
  const { isAuthenticated, register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: false });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const result = await registerUser(data.email, data.password, data.full_name, data.role);
    if (result.success) {
      setSuccessMessage(result.message);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/auth/login'), 3000);
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* Left Panel — Branding */}
      <div
        className="gradient-hero"
        style={{
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={28} color="white" />
            </div>
            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Datasurv Pro</span>
          </div>

          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Join the team.<br />
            <span style={{ color: 'var(--color-accent-400)' }}>Get started today.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 380 }}>
            Create your account and choose the role that fits your work — whether you're managing the organisation, reviewing submissions, or collecting data in the field.
          </p>

          {/* Role cards (decorative preview) */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(Object.entries(ROLE_CONFIG) as [RoleOption, typeof ROLE_CONFIG[RoleOption]][]).map(([key, cfg]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  {cfg.icon}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{cfg.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{cfg.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
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
        <div style={{ width: '100%', maxWidth: 480 }} className="animate-fade-in">

          {/* Success State */}
          {successMessage ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle2 size={36} color="#059669" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-surface-900)', marginBottom: '0.75rem' }}>
                Account Created!
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-surface-500)', lineHeight: 1.6, maxWidth: 360, margin: '0 auto 1.5rem' }}>
                {successMessage}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-surface-400)' }}>
                Redirecting to login in a moment...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-surface-900)', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                Create your account
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-surface-500)', marginBottom: '2rem' }}>
                Choose your role, then fill in your details
              </p>

              {/* Server Error */}
              {serverError && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: '#fee2e2', color: '#991b1b', fontSize: '0.8125rem', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                  {serverError}
                </div>
              )}

              {/* Step 1 — Role Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-surface-600)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select your role
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(Object.entries(ROLE_CONFIG) as [RoleOption, typeof ROLE_CONFIG[RoleOption]][]).map(([key, cfg]) => {
                    const isSelected = selectedRole === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        id={`role-${key}`}
                        onClick={() => handleRoleSelect(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.875rem',
                          padding: '0.875rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${isSelected ? cfg.color : 'var(--color-surface-200)'}`,
                          background: isSelected ? `${cfg.color}08` : 'var(--color-surface-0)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left',
                          width: '100%',
                          boxShadow: isSelected ? `0 0 0 3px ${cfg.color}20` : 'none',
                        }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: isSelected ? cfg.gradient : 'var(--color-surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : 'var(--color-surface-400)', flexShrink: 0, transition: 'all 0.15s' }}>
                          {cfg.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? cfg.color : 'var(--color-surface-800)' }}>
                              {cfg.label}
                            </span>
                            <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: isSelected ? `${cfg.color}18` : 'var(--color-surface-100)', color: isSelected ? cfg.color : 'var(--color-surface-400)', fontWeight: 500 }}>
                              {cfg.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', marginTop: '0.125rem' }}>
                            {cfg.description}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={18} color={cfg.color} style={{ flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {errors.role.message}
                  </p>
                )}
                {/* Hidden input for role */}
                <input type="hidden" {...register('role')} />
              </div>

              {/* Step 2 — Details Form (shown after role is selected) */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  opacity: selectedRole ? 1 : 0.4,
                  pointerEvents: selectedRole ? 'auto' : 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Full Name */}
                <div>
                  <label className="label" htmlFor="full_name">Full Name</label>
                  <input
                    {...register('full_name')}
                    type="text"
                    className={`input ${errors.full_name ? 'input-error' : ''}`}
                    placeholder="Your full name"
                    id="full_name"
                    autoComplete="name"
                  />
                  {errors.full_name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.full_name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="label" htmlFor="reg-email">Email address</label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@company.com"
                    id="reg-email"
                    autoComplete="email"
                  />
                  {errors.email && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="label" htmlFor="reg-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`input ${errors.password ? 'input-error' : ''}`}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      id="reg-password"
                      autoComplete="new-password"
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-surface-400)', padding: 0 }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label" htmlFor="confirm_password">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      {...register('confirm_password')}
                      type={showConfirm ? 'text' : 'password'}
                      className={`input ${errors.confirm_password ? 'input-error' : ''}`}
                      placeholder="Re-enter your password"
                      id="confirm_password"
                      autoComplete="new-password"
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-surface-400)', padding: 0 }}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirm_password && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.confirm_password.message}</p>}
                </div>

                {/* Admin Secret Key — only shown when Admin is selected */}
                {selectedRole === 'admin' && (
                  <div style={{ borderRadius: 'var(--radius-lg)', padding: '1rem', background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
                    <label className="label" htmlFor="admin_key" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#5b21b6' }}>
                      <Lock size={14} />
                      Admin Secret Key
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        {...register('admin_key')}
                        type={showAdminKey ? 'text' : 'password'}
                        className={`input ${errors.admin_key ? 'input-error' : ''}`}
                        placeholder="Enter the admin secret key"
                        id="admin_key"
                        autoComplete="off"
                        style={{ paddingRight: '2.75rem' }}
                      />
                      <button type="button" onClick={() => setShowAdminKey(!showAdminKey)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: 0 }}>
                        {showAdminKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.admin_key && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.admin_key.message}</p>}
                    <p style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.5rem', opacity: 0.8 }}>
                      This key is provided by your organisation administrator.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  disabled={isLoading || !selectedRole}
                  id="register-submit"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Login link */}
              <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-surface-500)' }}>
                Already have an account?{' '}
                <Link to="/auth/login" style={{ color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
