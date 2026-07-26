import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { authApi } from '../api/authApi'
import { setUnauthorizedHandler } from '../api/axiosClient'
import type { LoginRequest, RegisterRequest, UserResponse, UserRole } from '../types'

/**
 * TOKEN-STRATEGIE (nach Umstellung auf httpOnly Cookies)
 */

type AuthContextValue = {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  roles: UserRole[]
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  reloadUser: () => Promise<void>
  hasAnyRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Lädt den aktuellen User über /users/me.
   * Schlägt fehl wenn kein gültiger Access Token vorhanden ist und
   * der Refresh ebenfalls fehlschlägt (z. B. Refresh Token abgelaufen).
   */
  const reloadUser = useCallback(async () => {
    const currentUser = await authApi.me()
    setUser(currentUser)
  }, [])

  const login = useCallback(
      async (request: LoginRequest) => {
        // authApi.login() setzt die Cookies – danach User laden
        await authApi.login(request)
        await reloadUser()
      },
      [reloadUser],
  )

  const register = useCallback(async (request: RegisterRequest) => {
    // Nur Registrierung – kein Auto-Login.
    // Falls Auto-Login gewünscht: await authApi.login(...) + reloadUser()
    await authApi.register(request)
  }, [])

  const logout = useCallback(async () => {
    try {
      // authApi.logout() revoked den Refresh Token im Backend
      // und löscht alle drei Cookies (MaxAge = 0).
      // Der X-CSRF-Token Header wird automatisch vom Interceptor gesetzt.
      await authApi.logout()
    } finally {
      // User-State zurücksetzen – auch wenn der Logout-Request fehlschlägt.
      // Die Cookies sind dann zwar noch vorhanden, aber der lokale State
      // zeigt den User als ausgeloggt.
      setUser(null)
    }
  }, [])

  useEffect(() => {
    // unauthorizedHandler wird vom axiosClient aufgerufen wenn ein
    // Refresh fehlschlägt (Refresh Token abgelaufen oder revoked).
    // Dann User-State zurücksetzen → ProtectedRoute leitet zu /login.
    setUnauthorizedHandler(() => {
      setUser(null)
    })

    async function bootstrapAuth() {
      try {
        await reloadUser()
      } catch {
        // Kein gültiger Token → nicht eingeloggt, kein Fehler anzeigen
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrapAuth()

    return () => {
      setUnauthorizedHandler(undefined)
    }
  }, [reloadUser])

  const value = useMemo<AuthContextValue>(() => {
    const roles = user?.roles ?? []

    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      roles,
      login,
      register,
      logout,
      reloadUser,
      hasAnyRole: (requiredRoles) =>
          requiredRoles.some((role) => roles.includes(role)),
    }
  }, [isLoading, login, logout, register, reloadUser, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}