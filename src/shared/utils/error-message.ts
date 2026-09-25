import type { AxiosError } from 'axios'
import { t } from '@/locales'

/**
 * Resolve a human-readable message from a failed request, following the
 * backend's error conventions (docs/01-api-integration.md §2.3). Used by the
 * http interceptor for global toasts and by screens that surface a message
 * inline (e.g. a login 401 on the email field).
 */
export function resolveErrorMessage(error: AxiosError): string {
  if (!error.response) return t('common.errors.network')

  const data = error.response.data as unknown
  if (typeof data === 'string') return data

  const body = data as Record<string, unknown>
  if (typeof body?.message === 'string') return body.message
  if (Array.isArray(body?.message)) return body.message.join(', ')
  if (typeof body?.error === 'string') return body.error

  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors as Record<string, string[] | string>)[0]
    const msg = Array.isArray(first) ? first[0] : first
    if (msg) return msg
  }

  const status = error.response.status
  if (status >= 500) return t('common.errors.server')
  if (status === 403) return t('common.errors.forbidden')
  return t('common.errors.unknown')
}
