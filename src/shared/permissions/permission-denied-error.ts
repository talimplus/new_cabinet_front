import type { Permission } from '@/shared/enums/permission.enum'

/**
 * Thrown by the request interceptor when the signed-in user holds none of the
 * keys an endpoint requires, so the call is never sent. The response
 * interceptor recognises it and stays silent — the user sees nothing, because
 * the UI that triggers such a call should already be hidden.
 */
export class PermissionDeniedError extends Error {
  readonly method: string
  readonly path: string
  readonly required: Permission[]

  constructor(method: string, path: string, required: Permission[]) {
    super(`[permissions] ${method.toUpperCase()} ${path} needs ${required.join(' | ')}`)
    this.name = 'PermissionDeniedError'
    this.method = method
    this.path = path
    this.required = required
  }
}

export function isPermissionDeniedError(error: unknown): error is PermissionDeniedError {
  return error instanceof PermissionDeniedError
}
