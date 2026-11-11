import { hasInjectionContext, inject, onScopeDispose, watch } from 'vue'
import { routerKey, type LocationQuery, type LocationQueryValue, type Router } from 'vue-router'
import { QueryParam } from '@/shared/enums/query-param.enum'
import { parseDate, toDateString } from '@/shared/utils/format-date'

export interface QueryStateOptions<T extends object> {
  /** Fields kept in the URL. Default: every field of the state object. */
  keys?: Extract<keyof T, string>[]
  /**
   * How a field is parsed. Inferred from its default (string / number /
   * boolean / Date / string[]); a field whose default is `null` needs it
   * (falls back to STRING).
   */
  kinds?: Partial<Record<Extract<keyof T, string>, QueryParam>>
  /** Allowed values (an enum's `Object.values`); anything else falls back to the default. */
  oneOf?: Partial<Record<Extract<keyof T, string>, readonly unknown[] | (() => readonly unknown[])>>
  /** Fields typed into a text box — their URL write waits until typing stops. */
  debounce?: Extract<keyof T, string>[]
  /** Prefix for every query key, for two states on one page that share a field name. */
  prefix?: string
  /**
   * The query changed from outside on the same page (a menu link to this page,
   * browser Back between two query states). The state is already restored from
   * the URL — reload the list here.
   */
  onExternalChange?: () => void
}

export interface QueryState {
  /** Re-read the state from the URL; fields absent from the URL get their defaults. */
  restore: () => void
}

const DEBOUNCE_MS = 400
const DATE_STRING = /^\d{4}-\d{2}(-\d{2})?$/

/** Writes of every instance on the page, merged into one `router.replace`. */
const queue: { path: string; patch: Record<string, string | undefined> } = { path: '', patch: {} }
let chain: Promise<void> = Promise.resolve()
/** > 0 while one of our own `replace` calls runs — its route change is not "external". */
let writing = 0

function enqueue(router: Router, path: string, patch: Record<string, string | undefined>): void {
  if (queue.path !== path) {
    queue.path = path
    queue.patch = {}
  }
  Object.assign(queue.patch, patch)
  chain = chain.then(() => flush(router)).catch(() => undefined)
}

async function flush(router: Router): Promise<void> {
  const patch = queue.patch
  queue.patch = {}
  const current = router.currentRoute.value
  // The user already left the page (e.g. a debounced write after a row click).
  if (!Object.keys(patch).length || current.path !== queue.path) return
  const query: LocationQuery = { ...current.query }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete query[key]
    else query[key] = value
  }
  const target = router.resolve({ path: current.path, query, hash: current.hash })
  if (target.fullPath === current.fullPath) return
  writing++
  try {
    // replace, not push — a filter change must not add a Back step.
    await router.replace(target)
  } finally {
    writing--
  }
}

function firstValue(raw: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === undefined) return undefined
  return v ?? ''
}

function inferKind(value: unknown): QueryParam {
  if (typeof value === 'number') return QueryParam.NUMBER
  if (typeof value === 'boolean') return QueryParam.BOOLEAN
  if (value instanceof Date) return QueryParam.DATE
  if (Array.isArray(value)) return QueryParam.STRING_ARRAY
  return QueryParam.STRING
}

function clone(value: unknown): unknown {
  if (Array.isArray(value)) return [...value]
  if (value instanceof Date) return new Date(value.getTime())
  return value
}

/** A value as it goes into the URL; '' means "empty". */
function encode(kind: QueryParam, value: unknown): string {
  if (value === null || value === undefined) return ''
  if (kind === QueryParam.DATE) return value instanceof Date ? toDateString(value) : ''
  if (Array.isArray(value)) return value.join(',')
  if (kind === QueryParam.BOOLEAN) return value ? '1' : '0'
  return String(value)
}

/** A raw URL value → state value; `undefined` = invalid (use the default). */
function decode(kind: QueryParam, raw: string): unknown {
  switch (kind) {
    case QueryParam.STRING:
      return raw
    case QueryParam.DATE_STRING:
      return raw === '' || DATE_STRING.test(raw) ? raw : undefined
    case QueryParam.STRING_ARRAY:
      return raw.split(',').filter(Boolean)
    case QueryParam.NUMBER_ARRAY:
      return raw.split(',').filter(Boolean).map(Number).filter(Number.isFinite)
    case QueryParam.NUMBER: {
      if (raw === '') return null
      const n = Number(raw)
      return Number.isFinite(n) ? n : undefined
    }
    case QueryParam.BOOLEAN:
      if (raw === '') return null
      if (raw === '1' || raw === 'true') return true
      if (raw === '0' || raw === 'false') return false
      return undefined
    case QueryParam.DATE:
      return raw === '' ? null : DATE_STRING.test(raw) ? (parseDate(raw) ?? undefined) : undefined
  }
}

/**
 * Two-way binds a reactive filter object (or a `reactive({ tab })` wrapper
 * around refs) to the URL query, so a reload or Back from an inner page shows
 * the same list.
 *
 * - Reads the query **synchronously** on call, so the first fetch in
 *   `onMounted` already uses the restored values.
 * - Writes with `router.replace`; values equal to their default are left out.
 * - Without a router (unit tests calling the composable directly) it is a
 *   no-op and `restore()` resets to the defaults.
 */
export function useQueryState<T extends object>(state: T, options: QueryStateOptions<T> = {}): QueryState {
  const router = hasInjectionContext() ? inject(routerKey, null) : null
  const rec = state as Record<string, unknown>
  const keys: string[] = options.keys ?? Object.keys(state)
  const prefix = options.prefix ?? ''
  const defaults: Record<string, unknown> = {}
  const kinds: Record<string, QueryParam> = {}
  const oneOf = (options.oneOf ?? {}) as Record<string, readonly unknown[] | (() => readonly unknown[])>
  const debounced = new Set<string>(options.debounce ?? [])
  for (const key of keys) {
    defaults[key] = clone(rec[key])
    kinds[key] = (options.kinds as Record<string, QueryParam> | undefined)?.[key] ?? inferKind(rec[key])
  }

  function allowed(key: string, value: unknown): boolean {
    const list = oneOf[key]
    if (!list) return true
    const values = typeof list === 'function' ? list() : list
    if (Array.isArray(value)) return value.every((v) => values.includes(v))
    return value === null || value === '' || values.includes(value)
  }

  /** Every owned field as its URL value; `undefined` = equals the default (omitted). */
  function serialize(): Record<string, string | undefined> {
    const out: Record<string, string | undefined> = {}
    for (const key of keys) {
      const kind = kinds[key]!
      const value = encode(kind, rec[key])
      out[key] = value === encode(kind, defaults[key]) ? undefined : value
    }
    return out
  }

  function read(query: LocationQuery): void {
    for (const key of keys) {
      const raw = firstValue(query[prefix + key])
      const parsed = raw === undefined ? undefined : decode(kinds[key]!, raw)
      rec[key] = parsed !== undefined && allowed(key, parsed) ? parsed : clone(defaults[key])
    }
  }

  let committed: Record<string, string | undefined> = {}
  function restore(): void {
    read(router ? router.currentRoute.value.query : {})
    committed = serialize()
  }
  restore()
  if (!router) return { restore }

  const path = router.currentRoute.value.path
  let timer: ReturnType<typeof setTimeout> | undefined

  function commit(next: Record<string, string | undefined>): void {
    committed = next
    const patch: Record<string, string | undefined> = {}
    for (const key of keys) patch[prefix + key] = next[key]
    enqueue(router!, path, patch)
  }

  watch(serialize, (next) => {
    const changed = keys.filter((k) => next[k] !== committed[k])
    if (!changed.length) return
    clearTimeout(timer)
    if (changed.every((k) => debounced.has(k))) timer = setTimeout(() => commit(serialize()), DEBOUNCE_MS)
    else commit(next)
  })

  // `sync` so our own replace is still flagged by `writing` when this runs.
  watch(
    () => router.currentRoute.value.fullPath,
    () => {
      const route = router.currentRoute.value
      if (writing || route.path !== path) return
      const external = keys.some((k) => {
        const raw = firstValue(route.query[prefix + k])
        // An explicit default in the URL (`?page=1`) is the same as none.
        const normalized = raw === encode(kinds[k]!, defaults[k]) ? undefined : raw
        return normalized !== committed[k]
      })
      if (!external) return
      clearTimeout(timer)
      restore()
      options.onExternalChange?.()
    },
    { flush: 'sync' },
  )

  onScopeDispose(() => clearTimeout(timer))
  return { restore }
}
