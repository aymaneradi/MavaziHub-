import type { AuthResponse } from '../types/Auth'

const accessTokenKey = 'mavazihub.accessToken'
const refreshTokenKey = 'mavazihub.refreshToken'

export function saveTokens(tokens: AuthResponse) {
  localStorage.setItem(accessTokenKey, tokens.accessToken)
  localStorage.setItem(refreshTokenKey, tokens.refreshToken)
}

export function getAccessToken() {
  return localStorage.getItem(accessTokenKey)
}

export function getRefreshToken() {
  return localStorage.getItem(refreshTokenKey)
}

export function clearTokens() {
  localStorage.removeItem(accessTokenKey)
  localStorage.removeItem(refreshTokenKey)
}
