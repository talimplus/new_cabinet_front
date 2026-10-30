import type { Router } from 'vue-router'

/** Not every browser has it (Safari) — a short timeout is close enough. */
function whenIdle(cb: () => void): void {
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(cb)
  else window.setTimeout(cb, 200)
}

let started = false

/**
 * Pages are lazy chunks, so the FIRST click on a menu item used to wait for its
 * JS to download — the app looked frozen for a second or two. Once the cabinet
 * has rendered, every page chunk is fetched in the background (idle time, a few
 * at a time); a later click then resolves from the module cache instantly.
 * Failures are ignored — that page simply loads on demand as before.
 */
export function prefetchRouteChunks(
  router: Router,
  /** Skip pages the user cannot open anyway (`meta.permission`, OR list). */
  canOpen: (permissions: string[]) => boolean,
  concurrency = 3,
): void {
  if (started || typeof window === 'undefined') return
  started = true

  const loaders = router
    .getRoutes()
    // Only cabinet pages: not login/register (guest) nor the dev playground.
    .filter((r) => !r.meta.guestOnly && r.name !== 'ui-kit')
    .filter((r) => !r.meta.permission?.length || canOpen(r.meta.permission as string[]))
    .map((r) => r.components?.default)
    .filter((c): c is () => Promise<unknown> => typeof c === 'function')

  let next = 0
  const pump = (): void => {
    const loader = loaders[next++]
    if (!loader) return
    loader()
      .catch(() => undefined)
      .finally(() => whenIdle(pump))
  }
  whenIdle(() => {
    for (let i = 0; i < concurrency; i++) pump()
  })
}
