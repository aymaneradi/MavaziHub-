import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const LEGACY_ACCESS_TOKEN_STORAGE_KEY = 'mavazihub.accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'mavazihub.refreshToken'

type UnauthorizedHandler = () => void
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let unauthorizedHandler: UnauthorizedHandler | undefined
let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export const getAccessToken = () => accessToken
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  setAccessToken(accessToken)
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export const setAccessToken = (nextAccessToken: string | null) => {
  accessToken = nextAccessToken
}

export const clearAuthTokens = () => {
  setAccessToken(null)
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY)
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

const publicAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

function isAuthRefreshRequest(config?: InternalAxiosRequestConfig) {
  return config?.url?.includes('/auth/refresh') ?? false
}

function isAuthRequestThatShouldNotRefresh(config?: InternalAxiosRequestConfig) {
  const url = config?.url ?? ''
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/logout')
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return null
  }

  if (!refreshPromise) {
    refreshPromise = publicAxiosClient
      .post('/auth/refresh', { refreshToken })
      .then((response) => {
        const nextAccessToken = response.data.accessToken as string
        const nextRefreshToken = response.data.refreshToken as string
        setAuthTokens(nextAccessToken, nextRefreshToken)
        return nextAccessToken
      })
      .catch(() => {
        clearAuthTokens()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (error.response?.status === 401) {
      if (
        originalRequest &&
        !originalRequest._retry &&
        !isAuthRefreshRequest(originalRequest) &&
        !isAuthRequestThatShouldNotRefresh(originalRequest)
      ) {
        originalRequest._retry = true
        const nextAccessToken = await refreshAccessToken()

        if (nextAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
          return axiosClient(originalRequest)
        }
      }

      clearAuthTokens()
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)
