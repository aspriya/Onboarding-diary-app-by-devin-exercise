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
import TasksPage from './pages/TasksPage';
import IssuesPage from './pages/IssuesPage';
import FeedbackPage from './pages/FeedbackPage';
import NotesPage from './pages/NotesPage';
import ChartsPage from './pages/ChartsPage';
import ReportsPage from './pages/ReportsPage';
import ManagerPage from './pages/ManagerPage';
import SearchPage from './pages/SearchPage';
import ChecklistPage from './pages/ChecklistPage';

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
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/analytics" element={<ChartsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route
                path="/manager"
                element={
                  <ProtectedRoute roles={['manager', 'admin']}>
                    <ManagerPage />
                  </ProtectedRoute>
                }
              />
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
