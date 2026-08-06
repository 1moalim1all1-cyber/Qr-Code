import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import PublicMenuPage from './pages/public/MenuPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/owner/DashboardPage'
import MenuPage from './pages/owner/MenuPage'
import QRCodePage from './pages/owner/QRCodePage'
import SettingsPage from './pages/owner/SettingsPage'
import OrdersPage from './pages/owner/OrdersPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCreateClientPage from './pages/admin/AdminCreateClientPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Admin dashboard and the public per-restaurant menu page (/m/:slug)
// plug in here as the next build steps (see README roadmap).

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/m/:slug" element={<PublicMenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['owner', 'staff']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/menu"
        element={
          <ProtectedRoute allowedRoles={['owner', 'staff']}>
            <MenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/qr"
        element={
          <ProtectedRoute allowedRoles={['owner', 'staff']}>
            <QRCodePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute allowedRoles={['owner', 'staff']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/orders"
        element={
          <ProtectedRoute allowedRoles={['owner', 'staff']}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients/new"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminCreateClientPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients/:id/menu"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <MenuPage backTo="/admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients/:id/qr"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <QRCodePage backTo="/admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients/:id/orders"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <OrdersPage backTo="/admin" />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
