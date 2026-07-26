import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * TOKEN-STRATEGIE (nach Umstellung auf httpOnly Cookies)
 */

type UnauthorizedHandler = () => void
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let unauthorizedHandler: UnauthorizedHandler | undefined
let refreshPromise: Promise<boolean> | null = null

export const setUnauthorizedHandler = (handler?: UnauthorizedHandler) => {
  unauthorizedHandler = handler
}

/**
 * Liest den CSRF-Token aus dem csrfToken-Cookie.
 * Dieser Cookie ist NICHT httpOnly, damit JS ihn lesen kann.
 */
function getCsrfToken(): string | null {
  const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('csrfToken='))

  return match ? match.split('=')[1] : null
}

/**
 * Versucht den Access Token über den Refresh Token zu erneuern.
 * Da beide Tokens httpOnly Cookies sind, braucht das Frontend
 * keinen Body mitzuschicken – der Browser schickt die Cookies automatisch.
 * Gibt true zurück wenn der Refresh erfolgreich war, sonst false.
 */
async function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = axios
        .post(
            '/api/auth/refresh',
            {},
            {
              withCredentials: true,
              // Kein X-CSRF-Token für /auth/refresh nötig –
              // der Endpoint ist in CsrfValidationFilter.EXCLUDED_PATHS
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
  // withCredentials: true ist zwingend damit der Browser die
  // httpOnly Cookies bei Cross-Origin-Anfragen mitschickt.
  withCredentials: true,
})

/**
 * Request-Interceptor: CSRF-Token als Header anhängen.
 * Wird bei jeder schreibenden Anfrage (POST, PUT, PATCH, DELETE)
 * vom CsrfValidationFilter im Backend erwartet.
 */
axiosClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken()
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})

/**
 * Response-Interceptor: bei 401 automatisch den Access Token erneuern
 * und die ursprüngliche Anfrage einmalig wiederholen.
 */
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
          // Nach erfolgreichem Refresh hat das Backend einen neuen
          // csrfToken-Cookie gesetzt – neu lesen und anhängen.
          const newCsrfToken = getCsrfToken()
          if (newCsrfToken) {
            originalRequest.headers['X-CSRF-Token'] = newCsrfToken
          }
          return axiosClient(originalRequest)
        }

        // Refresh fehlgeschlagen → Cookies sind gelöscht (Backend),
        // unauthorizedHandler informiert den AuthContext.
        unauthorizedHandler?.()
      }

      return Promise.reject(error)
    },
)