import { type ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getRestaurantByOwner } from '@/services/restaurants'
import type { Restaurant, UserRole } from '@/types/database'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  requireActiveRestaurant?: boolean
}

export default function ProtectedRoute({ children, allowedRoles, requireActiveRestaurant = true }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [restaurantLoading, setRestaurantLoading] = useState(false)

  useEffect(() => {
    if (!user || !profile || !requireActiveRestaurant || profile.role !== 'owner') {
      setRestaurantLoading(false)
      return
    }
    setRestaurantLoading(true)
    getRestaurantByOwner(user.uid)
      .then(setRestaurant)
      .catch(() => setRestaurant(null))
      .finally(() => setRestaurantLoading(false))
  }, [user, profile, requireActiveRestaurant, location.pathname])

  if (loading || restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-stone">
        جارِ التحميل...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={profile.role === 'super_admin' ? '/admin' : '/dashboard'} replace />
  }

  if (profile?.role === 'owner') {
    const accountStatus = profile.account_status || 'pending'

    if (location.pathname !== '/activation-pending' && accountStatus !== 'active') {
      return <Navigate to="/activation-pending" replace />
    }

    if (requireActiveRestaurant && (!restaurant || restaurant.status !== 'active')) {
      return <Navigate to="/activation-pending" replace />
    }
  }

  return <>{children}</>
}
