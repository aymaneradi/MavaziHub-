import { axiosClient, clearAuthTokens, setAuthTokens } from './axiosClient'
import type {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  RegisterRequest,
  UserResponse,
} from '../types'

export const authApi = {
  async register(request: RegisterRequest): Promise<void> {
    await axiosClient.post('/auth/register', request)
  },

  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosClient.post<AuthResponse>('/auth/login', request)
    setAuthTokens(data.accessToken, data.refreshToken)
    return data
  },

  async refresh(request: RefreshRequest): Promise<AuthResponse> {
    const { data } = await axiosClient.post<AuthResponse>('/auth/refresh', request)
    setAuthTokens(data.accessToken, data.refreshToken)
    return data
  },

  async logout(request: LogoutRequest): Promise<void> {
    try {
      await axiosClient.post('/auth/logout', request)
    } finally {
      clearAuthTokens()
    }
  },

  async me(): Promise<UserResponse> {
    const { data } = await axiosClient.get<UserResponse>('/auth/me')
    return data
  },
}
