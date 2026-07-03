import { getRefreshToken } from '../auth/tokenStorage'
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types/Auth'
import { axiosClient } from './axiosClient'

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await axiosClient.post<AuthResponse>('/auth/login', request)
  return response.data
}

export async function register(request: RegisterRequest): Promise<void> {
  await axiosClient.post('/auth/register', request)
}

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await axiosClient.get<UserProfile>('/users/me')
  return response.data
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return
  }

  await axiosClient.post('/auth/logout', { refreshToken })
}
