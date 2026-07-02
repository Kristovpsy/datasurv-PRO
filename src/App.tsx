/**
 * App Root — Router Configuration
 * --------------------------
 * Route structure follows the 3-tier RBAC model:
 *   Level 1: Field Officer — Dashboard, My Submissions
 *   Level 2: Editor — all + Review Queue + form editing
 *   Level 3: Admin — all views read-only + Team, Audit, Settings
 */

import { useEffect, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout';
import { RoleGuard } from '@/components/auth';
import { useAuthStore } from '@/stores';
import {
  LandingPage,
  LoginPage,
  DashboardPage,
  ProjectListPage,
  FormListPage,
  FormBuilderPage,
  FormAnalyticsPage,
  FormResponsesPage,
  FormDistributePage,
  TeamManagementPage,
  AuditLogPage,
  OrgSettingsPage,
  RespondentFormPage,
  ReviewQueuePage,
  MySubmissionsPage,
} from '@/pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ---- Error Boundary ----
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9fafb',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: 480,
            textAlign: 'center',
            padding: '3rem',
            borderRadius: '1rem',
            background: 'white',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#fee2e2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1.5rem',
              fontSize: '2rem',
            }}>⚠️</div>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 700,
              color: '#111827', marginBottom: '0.5rem',
            }}>Something went wrong</h1>
            <p style={{
              fontSize: '0.9375rem', color: '#6b7280',
              marginBottom: '1.5rem', lineHeight: 1.6,
            }}>
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <pre style={{
                fontSize: '0.75rem', color: '#991b1b',
                background: '#fef2f2', padding: '0.75rem 1rem',
                borderRadius: '0.5rem', textAlign: 'left',
                overflow: 'auto', marginBottom: '1.5rem',
                maxHeight: 120,
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                padding: '0.75rem 2rem', borderRadius: '0.5rem',
                background: '#6366f1', color: 'white', border: 'none',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Refresh & Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ---- App ----
function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Public Form Renderer — no auth required */}
            <Route path="/r/:publicId" element={<RespondentFormPage />} />

            {/* Authenticated Routes */}
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />

              {/* Dashboard — All roles */}
              <Route path="dashboard" element={<DashboardPage />} />

              {/* My Submissions — Field Officer */}
              <Route
                path="my-submissions"
                element={
                  <RoleGuard allowedRoles={['field_officer', 'editor', 'admin', 'superadmin']}>
                    <MySubmissionsPage />
                  </RoleGuard>
                }
              />

              {/* Projects — Editor+ (admin can view) */}
              <Route
                path="projects"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <ProjectListPage />
                  </RoleGuard>
                }
              />
              <Route
                path="projects/:id/forms"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <FormListPage />
                  </RoleGuard>
                }
              />

              {/* Forms — Editor+ */}
              <Route
                path="forms"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <FormListPage />
                  </RoleGuard>
                }
              />
              <Route
                path="forms/:id/builder"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <FormBuilderPage />
                  </RoleGuard>
                }
              />
              <Route
                path="forms/:id/analytics"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <FormAnalyticsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="forms/:id/responses"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <FormResponsesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="forms/:id/distribute"
                element={
                  <RoleGuard allowedRoles={['editor', 'superadmin']}>
                    <FormDistributePage />
                  </RoleGuard>
                }
              />

              {/* Review Queue — Editor only */}
              <Route
                path="review"
                element={
                  <RoleGuard allowedRoles={['editor', 'superadmin']}>
                    <ReviewQueuePage />
                  </RoleGuard>
                }
              />

              {/* Team — Editor+ */}
              <Route
                path="team"
                element={
                  <RoleGuard allowedRoles={['editor', 'admin', 'superadmin']}>
                    <TeamManagementPage />
                  </RoleGuard>
                }
              />

              {/* Audit Log — Admin only */}
              <Route
                path="audit-log"
                element={
                  <RoleGuard allowedRoles={['admin', 'superadmin']}>
                    <AuditLogPage />
                  </RoleGuard>
                }
              />

              {/* Settings — Admin (absorbs superadmin) */}
              <Route
                path="settings"
                element={
                  <RoleGuard allowedRoles={['admin', 'superadmin']}>
                    <OrgSettingsPage />
                  </RoleGuard>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
