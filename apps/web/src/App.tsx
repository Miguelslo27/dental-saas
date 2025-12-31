import { Routes, Route, Navigate } from 'react-router'
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/auth/LoginPage'
import RegisterPage from '@pages/auth/RegisterPage'
import UnauthorizedPage from '@pages/auth/UnauthorizedPage'

// Admin pages
import AdminLayout from '@/components/admin/AdminLayout'
import AdminSetupPage from '@pages/admin/AdminSetupPage'
import AdminLoginPage from '@pages/admin/AdminLoginPage'
import AdminDashboardPage from '@pages/admin/AdminDashboardPage'
import AdminTenantsPage from '@pages/admin/AdminTenantsPage'
import AdminUsersPage from '@pages/admin/AdminUsersPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin routes (separate auth flow) */}
      <Route path="/admin/setup" element={<AdminSetupPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Protected admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="tenants" element={<AdminTenantsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  )
}

export default App
