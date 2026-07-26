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

  const reloadUser = useCallback(async () => {
    const currentUser = await authApi.me()
    setUser(currentUser)
  }, [])

  const login = useCallback(
      async (request: LoginRequest) => {
        await authApi.login(request)
        await reloadUser()
      },
      [reloadUser],
  )

  const register = useCallback(async (request: RegisterRequest) => {
    await authApi.register(request)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
    })

    async function bootstrapAuth() {
      try {
        await reloadUser()
      } catch {
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
