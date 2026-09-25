import axios, { type AxiosError } from 'axios'
import { useNotificationStore } from '@/stores/notification.store'
import { useUserStore } from '@/stores/user.store'
import { useScopeStore } from '@/stores/scope.store'
import { resolveErrorMessage } from '@/shared/utils/error-message'
import { findApiRule, normalizePath } from '@/shared/permissions/match-api-rule'
import {
  PermissionDeniedError,
  isPermissionDeniedError,
} from '@/shared/permissions/permission-denied-error'

// Per-request opt-out of the global error toast — for screens that surface the
// error inline instead (e.g. login shows it on the email field).
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalError?: boolean
  }
}

export const TOKEN_KEY = 'token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the Bearer token, then stop requests the user has no permission for
// (docs/03-roles-permissions.md §4): a 403 carries no information the UI could
// use, so the call is dropped instead of fired. The backend stays the real
// gate; hiding the triggering UI is still required.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`

  const rule = findApiRule(config.method ?? 'get', normalizePath(config.url ?? '', config.baseURL))

  if (rule?.permissions.length) {
    let userStore: ReturnType<typeof useUserStore> | null = null
    try {
      userStore = useUserStore()
    } catch {
      // Pinia isn't active yet (very early bootstrap) — let the call through.
    }
    if (userStore?.isAuthenticated && !userStore.can(...rule.permissions)) {
      throw new PermissionDeniedError(config.method ?? 'get', config.url ?? '', rule.permissions)
    }
  }

  // Append the header's active center — only on endpoints that accept it, or
  // the backend's `forbidNonWhitelisted` answers 422 (docs §2.6). A call that
  // passed its own `centerId` is left alone.
  if (rule?.acceptsCenterId) {
    try {
      const scope = useScopeStore()
      const params = (config.params ?? {}) as Record<string, unknown>
      if (scope.requestCenterId !== undefined && params.centerId === undefined) {
        config.params = { ...params, centerId: scope.requestCenterId }
      }
    } catch {
      // Pinia isn't active yet — send the request unscoped.
    }
  }

  return config
})

// Blocked request → silent. 401 → logout+redirect (no toast). Anything else →
// global toast, then rethrow so screens can map field errors.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isPermissionDeniedError(error)) {
      if (import.meta.env.DEV) console.warn(error.message)
      return Promise.reject(error)
    }

    const axiosError = error as AxiosError
    if (axiosError.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (!location.pathname.startsWith('/login')) location.assign('/login')
      return Promise.reject(error)
    }
    if (!axiosError.config?.skipGlobalError) {
      useNotificationStore().error(resolveErrorMessage(axiosError))
    }
    return Promise.reject(error)
  },
)
