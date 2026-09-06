import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import TasksPage from './pages/TasksPage'
import DeliverablesPage from './pages/DeliverablesPage'
import ActivityPage from './pages/ActivityPage'
import NotificationsPage from './pages/NotificationsPage'
import ProjectSummaryPage from './pages/ProjectSummaryPage'
import AdminClientsPage from './pages/AdminClientsPage'
import AdminAllProjectsPage from './pages/AdminAllProjectsPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const AppRoutes = () => {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/tasks" element={<TasksPage />} />
        <Route path="projects/:id/deliverables" element={<DeliverablesPage />} />
        <Route path="projects/:id/activity" element={<ActivityPage />} />
        <Route path="projects/:id/summary" element={<ProjectSummaryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="clients" element={<AdminClientsPage />} />
        <Route path="all-projects" element={<AdminAllProjectsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
