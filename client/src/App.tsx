import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<PlaceholderPage title="Tasks" description="Task management coming in Phase 2." />} />
              <Route path="/issues" element={<PlaceholderPage title="Issues" description="Issue tracking coming in Phase 2." />} />
              <Route path="/feedback" element={<PlaceholderPage title="Feedback" description="Feedback notes coming in Phase 2." />} />
              <Route path="/notes" element={<PlaceholderPage title="Notes" description="Additional notes coming in Phase 2." />} />
              <Route path="/checklist" element={<PlaceholderPage title="Checklist" description="Onboarding checklist coming in Phase 4." />} />
              <Route path="/reports" element={<PlaceholderPage title="Reports" description="Reports & exports coming in Phase 3." />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <PlaceholderPage title="User Management" description="Admin user management coming in Phase 5." />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
