// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';

// Public Marketing & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { CreateAccountPage } from './pages/CreateAccountPage';

// Authenticated Application Workspace Pages
import { Dashboard } from './pages/Dashboard';
import { FacilitiesAndStreamsPage } from './pages/FacilitiesAndStreamsPage';
import { TestWorthinessAssessment } from './pages/TestWorthinessAssessment';
import { LaboratoryResults } from './pages/LaboratoryResults';
import { RecoveryAnalysis } from './pages/RecoveryAnalysis';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { CompanySettingsPage } from './pages/CompanySettingsPage';
import { PlatformOwnerPage } from './pages/PlatformOwnerPage';

// Platform Admin / Research Console
import { ResearchConsolePage } from './pages/ResearchConsolePage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F3] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#26734D] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Internal Workspace Layout with Sage Sidebar
const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F7F8F3] text-[#202C25]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />

          {/* Research & Intelligence Console (Direct Access) */}
          <Route path="/console" element={<ResearchConsolePage />} />

          {/* Authenticated Company Workspace (Section 6 & Reference Panels 4-11) */}
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <Dashboard />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/facilities"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <FacilitiesAndStreamsPage />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/investigation"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <TestWorthinessAssessment />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/laboratory"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <LaboratoryResults />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/recovery"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <RecoveryAnalysis />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/recommendations"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <RecommendationsPage />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <CompanySettingsPage />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/platform-owner"
            element={
              <ProtectedRoute>
                <WorkspaceLayout>
                  <PlatformOwnerPage />
                </WorkspaceLayout>
              </ProtectedRoute>
            }
          />

          {/* Backwards compatibility redirects */}
          <Route path="/platform-owner" element={<Navigate to="/app/platform-owner" replace />} />
          <Route path="/admin" element={<Navigate to="/app/platform-owner" replace />} />
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/facilities" element={<Navigate to="/app/facilities" replace />} />
          <Route path="/waste-streams" element={<Navigate to="/app/facilities" replace />} />
          <Route path="/test-worthiness" element={<Navigate to="/app/investigation" replace />} />
          <Route path="/lab-results" element={<Navigate to="/app/laboratory" replace />} />
          <Route path="/recovery" element={<Navigate to="/app/recovery" replace />} />
          <Route path="/recommendations" element={<Navigate to="/app/recommendations" replace />} />
          <Route path="/companies" element={<Navigate to="/app/settings" replace />} />
          <Route path="/wir" element={<Navigate to="/console" replace />} />
          <Route path="/data-explorer" element={<Navigate to="/console" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
