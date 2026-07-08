import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface RoleBasedRouteProps {
    allowedRoles: string[]
}

function RoleBasedRoute({ allowedRoles }: RoleBasedRouteProps) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default RoleBasedRoute