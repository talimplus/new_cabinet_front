import { API_PERMISSIONS, HttpMethod, type ApiPermissionRule } from './api-permissions'

/**
 * Rules sorted by specificity so a static segment always beats a `:param` one
 * (`/groups/all` must win over `/groups/:id`). Ties break on segment count, so
 * longer templates are tried first.
 */
const SORTED: ApiPermissionRule[] = [...API_PERMISSIONS].sort((a, b) => {
  const segs = (p: string) => p.split('/').filter(Boolean)
  const statics = (p: string) => segs(p).filter((s) => !s.startsWith(':')).length
  return statics(b.path) - statics(a.path) || segs(b.path).length - segs(a.path).length
})

function segmentsMatch(template: string, path: string): boolean {
  const t = template.split('/').filter(Boolean)
  const p = path.split('/').filter(Boolean)
  if (t.length !== p.length) return false
  return t.every((seg, i) => seg.startsWith(':') || seg === p[i])
}

/** Strip the origin and query string so only the path is matched. */
export function normalizePath(url: string, baseURL?: string): string {
  let path = url
  if (baseURL && path.startsWith(baseURL)) path = path.slice(baseURL.length)
  path = path.replace(/^https?:\/\/[^/]+/i, '')
  const q = path.indexOf('?')
  if (q !== -1) path = path.slice(0, q)
  return path.startsWith('/') ? path : `/${path}`
}

/** The rule guarding this request, or `undefined` when the path is not listed. */
export function findApiRule(method: string, path: string): ApiPermissionRule | undefined {
  const upper = method.toUpperCase() as HttpMethod
  return SORTED.find((rule) => rule.method === upper && segmentsMatch(rule.path, path))
}
