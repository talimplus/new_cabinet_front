import { isPermissionDeniedError } from './permission-denied-error'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

/**
 * Wraps a **reference-data** request (the options behind a filter or form
 * select) so a permission-blocked call degrades to an empty list instead of
 * rejecting.
 *
 * Why: a page a user may open can still contain a select fed by a resource they
 * may not read — e.g. a teacher opens the syllabus list but holds no
 * `subjects.view`. The request interceptor correctly refuses to send that call;
 * without this wrapper the rejection would surface as an unhandled error even
 * though "no options" is the right answer.
 *
 * Only for optional data. A page's primary request must keep rejecting — if it
 * is blocked, the route guard should not have let the user in.
 */
export async function optionalRequest<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request
  } catch (error) {
    if (isPermissionDeniedError(error)) return fallback
    throw error
  }
}

/** The "no rows" fallback for a blocked paginated reference-data request. */
export function emptyPage<T>(): PaginatedResponse<T> {
  return { data: [], meta: { total: 0, page: 1, perPage: 0, totalPages: 1 } }
}
