import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

type UnauthorizedHandler = () => void
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let unauthorizedHandler: UnauthorizedHandler | undefined
let refreshPromise: Promise<boolean> | null = null

export const setUnauthorizedHandler = (handler?: UnauthorizedHandler) => {
  unauthorizedHandler = handler
}

function getCsrfToken(): string | null {
  const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('csrfToken='))

  return match ? match.split('=')[1] : null
}

async function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = axios
        .post(
            '/api/auth/refresh',
            {},
            {
              withCredentials: true,
            },
        )
        .then(() => true)
        .catch(() => false)
        .finally(() => {
          refreshPromise = null
        })
  }

  return refreshPromise
}

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

axiosClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  const csrfToken = getCsrfToken()
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/')

      if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !isAuthEndpoint
      ) {
        if (originalRequest) originalRequest._retry = true

        const refreshed = await attemptRefresh()

        if (refreshed && originalRequest) {
          const newCsrfToken = getCsrfToken()
          if (newCsrfToken) {
            originalRequest.headers['X-CSRF-Token'] = newCsrfToken
          }
          return axiosClient(originalRequest)
        }

        unauthorizedHandler?.()
      }

      return Promise.reject(error)
    },
)
