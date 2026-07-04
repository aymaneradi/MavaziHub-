import { axiosClient } from './axiosClient'
import type { ChangePasswordRequest, UpdateUserRequest, UserResponse } from '../types'

export const userApi = {
  async getMe(): Promise<UserResponse> {
    const { data } = await axiosClient.get<UserResponse>('/users/me')
    return data
  },

  async updateMe(request: UpdateUserRequest): Promise<UserResponse> {
    const { data } = await axiosClient.put<UserResponse>('/users/me', request)
    return data
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await axiosClient.patch('/users/me/password', request)
  },
}
