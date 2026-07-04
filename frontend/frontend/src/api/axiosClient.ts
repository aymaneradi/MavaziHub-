import axios, { AxiosError } from 'axios'

export const AUTH_TOKEN_STORAGE_KEY = 'mavazihub.accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'mavazihub.refreshToken'

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | undefined

export const getAccessToken = () => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export const clearAuthTokens = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

export const setUnauthorizedHandler = (handler?: UnauthorizedHandler) => {
  unauthorizedHandler = handler
}

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthTokens()
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)
