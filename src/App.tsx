/**
 * App Root — Router Configuration
 * --------------------------
 * Route structure follows the 3-tier RBAC model:
 *   Level 1: Field Officer — Dashboard, My Submissions
 *   Level 2: Editor — all + Review Queue + form editing
 *   Level 3: Admin — all views read-only + Team, Audit, Settings
 */

import { useEffect } from 'react';
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

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
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
  );
}

export default App;
