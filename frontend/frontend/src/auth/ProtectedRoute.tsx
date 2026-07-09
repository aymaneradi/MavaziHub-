import { Navigate, Outlet, useLocation } from 'react-router-dom'

import type { UserRole } from '../types'
import { useAuth } from './AuthContext'

type ProtectedRouteProps = {
  roles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ roles, redirectTo = '/login' }: ProtectedRouteProps) {
  const location = useLocation()
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <section className="auth-status">
        <p className="eyebrow">Mein Bereich</p>
        <h1>Zugang wird geprüft</h1>
      </section>
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  if (roles && !auth.hasAnyRole(roles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
