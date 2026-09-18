import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'

const LandingPage = lazy(() => import('./pages/public/LandingPage'))
const PublicMenuPage = lazy(() => import('./pages/public/ThemedMenuPage'))
const OrderTrackingPage = lazy(() => import('./pages/public/OrderTrackingPage'))
const TermsPage = lazy(() => import('./pages/public/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'))
const RestaurantsDirectoryPage = lazy(() => import('./pages/public/RestaurantsDirectoryPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ActivationPendingPage = lazy(() => import('./pages/auth/ActivationPendingPage'))
const DashboardPage = lazy(() => import('./pages/owner/DashboardPage'))
const MenuPage = lazy(() => import('./pages/owner/MenuPage'))
const CatalogPage = lazy(() => import('./pages/owner/CatalogPage'))
const DesignPage = lazy(() => import('./pages/owner/DesignPage'))
const QRCodePage = lazy(() => import('./pages/owner/QRCodePage'))
const SettingsPage = lazy(() => import('./pages/owner/SettingsPage'))
const OrdersPage = lazy(() => import('./pages/owner/OrdersPage'))
const OffersPage = lazy(() => import('./pages/owner/OffersPage'))
const DataToolsPage = lazy(() => import('./pages/owner/DataToolsPage'))
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'))
const AdminCreateClientPage = lazy(() => import('./pages/admin/AdminCreateClientPage'))
const AdminCatalogPage = lazy(() => import('./pages/admin/AdminCatalogPage'))

function RouteLoading() {
  return <div className="min-h-screen flex items-center justify-center bg-paper"><div className="w-8 h-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" /></div>
}

function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/m/:slug" element={<PublicMenuPage />} />
        <Route path="/m/:slug/order/:orderId" element={<OrderTrackingPage />} />
        <Route path="/restaurants" element={<RestaurantsDirectoryPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activation-pending" element={<ProtectedRoute allowedRoles={['owner']} requireActiveRestaurant={false}><ActivationPendingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/menu" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><MenuPage /></ProtectedRoute>} />
        <Route path="/dashboard/catalog" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><CatalogPage /></ProtectedRoute>} />
        <Route path="/dashboard/design" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><DesignPage /></ProtectedRoute>} />
        <Route path="/dashboard/qr" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><QRCodePage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><OrdersPage /></ProtectedRoute>} />
        <Route path="/dashboard/offers" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><OffersPage /></ProtectedRoute>} />
        <Route path="/dashboard/data" element={<ProtectedRoute allowedRoles={['owner', 'staff']}><DataToolsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminHomePage /></ProtectedRoute>} />
        <Route path="/admin/catalog" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminCatalogPage /></ProtectedRoute>} />
        <Route path="/admin/clients/new" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminCreateClientPage /></ProtectedRoute>} />
        <Route path="/admin/clients/:id/menu" element={<ProtectedRoute allowedRoles={['super_admin']}><MenuPage backTo="/admin" /></ProtectedRoute>} />
        <Route path="/admin/clients/:id/qr" element={<ProtectedRoute allowedRoles={['super_admin']}><QRCodePage backTo="/admin" /></ProtectedRoute>} />
        <Route path="/admin/clients/:id/orders" element={<ProtectedRoute allowedRoles={['super_admin']}><OrdersPage backTo="/admin" /></ProtectedRoute>} />
        <Route path="/admin/clients/:id/offers" element={<ProtectedRoute allowedRoles={['super_admin']}><OffersPage backTo="/admin" /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  )
}

export default App
