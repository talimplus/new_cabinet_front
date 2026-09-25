import type { AxiosError } from 'axios'

/** Backend validation error body: `{ errors: { field: ['msg', ...] } }`. */
interface ValidationErrorBody {
  errors?: Record<string, string[] | string>
  message?: string | string[]
}

/**
 * Map a failed request into a `{ field: message }` record suitable for
 * vee-validate's `setErrors`. Returns an empty object when the error carries no
 * field-level validation info (those are surfaced as a global toast instead).
 */
export function mapBackendErrors(error: unknown): Record<string, string> {
  const body = (error as AxiosError<ValidationErrorBody>)?.response?.data
  const out: Record<string, string> = {}
  if (!body?.errors) return out

  for (const [field, messages] of Object.entries(body.errors)) {
    out[field] = (Array.isArray(messages) ? messages[0] : messages) ?? ''
  }
  return out
}
