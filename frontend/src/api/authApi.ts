import { axiosClient } from './axiosClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/Auth'

export const authApi = {
    register: async (payload: RegisterRequest): Promise<void> => {
        await axiosClient.post('/api/auth/register', payload)
    },

    login: async (payload: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/api/auth/login', payload)
        return response.data
    },
}