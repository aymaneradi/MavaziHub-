import { axiosClient } from './axiosClient'
import type { LoginRequest, RegisterRequest, UserResponse } from '../types'

/**
 * Auth-API nach Umstellung auf httpOnly Cookies.
 */
export const authApi = {

  async register(request: RegisterRequest): Promise<void> {
    await axiosClient.post('/auth/register', request)
  },

  /**
   * Login: schickt E-Mail und Passwort, erhält drei Cookies zurück:
   */
  async login(request: LoginRequest): Promise<void> {
    await axiosClient.post('/auth/login', request)
  },

  /**
   * Refresh: kein Body nötig.
   * Der Browser schickt den refreshToken-Cookie automatisch mit.
   * Das Backend setzt danach neue Cookies (Token Rotation).
   */
  async refresh(): Promise<void> {
    await axiosClient.post('/auth/refresh')
  },

  /**
   * Logout: kein Body nötig.
   * Der Browser schickt den refreshToken-Cookie automatisch mit.
   * Das Backend revoked den Token und löscht alle Cookies (MaxAge = 0).
   */
  async logout(): Promise<void> {
    await axiosClient.post('/auth/logout')
  },

  /**
   * Gibt den aktuell eingeloggten User zurück.
   * Der accessToken-Cookie wird automatisch mitgeschickt.
   */
  async me(): Promise<UserResponse> {
    const { data } = await axiosClient.get<UserResponse>('/users/me')
    return data
  },
}