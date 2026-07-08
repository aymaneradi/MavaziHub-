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
import { axiosClient } from '../api/axiosClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/Auth'

interface AuthContextType {
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    login: (payload: LoginRequest) => Promise<void>
    register: (payload: RegisterRequest) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem(ACCESS_TOKEN_KEY),
    )
    const [refreshToken, setRefreshToken] = useState<string | null>(
        localStorage.getItem(REFRESH_TOKEN_KEY),
    )

    const applyAuth = useCallback((data: AuthResponse) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)

        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken)

        axiosClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
    }, [])

    const login = useCallback(
        async (payload: LoginRequest) => {
            const data = await authApi.login(payload)
            applyAuth(data)
        },
        [applyAuth],
    )

    const register = useCallback(
        async (payload: RegisterRequest) => {
            await authApi.register(payload)

            const loginData = await authApi.login({
                email: payload.email,
                password: payload.password,
            })

            applyAuth(loginData)
        },
        [applyAuth],
    )

    const logout = useCallback(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)

        setAccessToken(null)
        setRefreshToken(null)

        delete axiosClient.defaults.headers.common.Authorization
    }, [])

    useEffect(() => {
        if (accessToken) {
            axiosClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        } else {
            delete axiosClient.defaults.headers.common.Authorization
        }
    }, [accessToken])

    const value = useMemo(
        () => ({
            accessToken,
            refreshToken,
            isAuthenticated: Boolean(accessToken),
            login,
            register,
            logout,
        }),
        [accessToken, refreshToken, login, register, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}