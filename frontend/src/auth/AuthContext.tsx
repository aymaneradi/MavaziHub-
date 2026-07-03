import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../api/authApi'
import type { LoginRequest, RegisterRequest, UserProfile } from '../types/Auth'
import { clearTokens, getAccessToken, saveTokens } from './tokenStorage'

type AuthContextValue = {
  currentUser: UserProfile | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isCurrentRequest = true

    async function restoreSession() {
      if (!getAccessToken()) {
        setIsInitializing(false)
        return
      }

      try {
        const user = await getCurrentUser()

        if (isCurrentRequest) {
          setCurrentUser(user)
        }
      } catch {
        clearTokens()
      } finally {
        if (isCurrentRequest) {
          setIsInitializing(false)
        }
      }
    }

    restoreSession()

    return () => {
      isCurrentRequest = false
    }
  }, [])

  async function login(request: LoginRequest) {
    const tokens = await loginRequest(request)
    saveTokens(tokens)

    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  async function register(request: RegisterRequest) {
    await registerRequest(request)

    // Das Backend gibt beim Registrieren kein Token zurueck, darum melden wir danach direkt an.
    await login({
      email: request.email,
      password: request.password,
    })
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      clearTokens()
      setCurrentUser(null)
    }
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isInitializing,
      login,
      register,
      logout,
    }),
    [currentUser, isInitializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
