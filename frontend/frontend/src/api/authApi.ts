import { axiosClient } from './axiosClient'
import type { LoginRequest, RegisterRequest, UserResponse } from '../types'

export const authApi = {

  async register(request: RegisterRequest): Promise<void> {
    await axiosClient.post('/auth/register', request)
  },

  async login(request: LoginRequest): Promise<void> {
    await axiosClient.post('/auth/login', request)
  },

  async refresh(): Promise<void> {
    await axiosClient.post('/auth/refresh')
  },

  async logout(): Promise<void> {
    await axiosClient.post('/auth/logout')
  },

  async me(): Promise<UserResponse> {
    const { data } = await axiosClient.get<UserResponse>('/users/me')
    return data
  },
}
