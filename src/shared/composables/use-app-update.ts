import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Notices a new deploy while a tab stays open. Every build writes its id to
 * `version.json` (see `vite.config.ts`) and bakes the same id into the bundle;
 * the tab polls the file and, once the ids differ, `available` turns on.
 * "Later" hides the prompt for a while; the next check shows it again.
 * In dev there is no `version.json`, so a failed fetch just stays quiet.
 */
export const UPDATE_CHECK_INTERVAL_MS = 60_000
export const UPDATE_SNOOZE_MS = 10 * 60_000

interface VersionFile {
  version?: string
}

export function useAppUpdate(current: string = __APP_VERSION__) {
  const available = ref(false)
  let snoozedUntil = 0
  let timer: ReturnType<typeof setInterval> | undefined

  async function check(): Promise<void> {
    if (Date.now() < snoozedUntil) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const { version } = (await res.json()) as VersionFile
      if (version && version !== current) available.value = true
    } catch {
      // Offline or no file (dev) — try again on the next tick.
    }
  }

  function later(): void {
    available.value = false
    snoozedUntil = Date.now() + UPDATE_SNOOZE_MS
  }

  function reload(): void {
    window.location.reload()
  }

  function onVisible(): void {
    if (document.visibilityState === 'visible') void check()
  }

  // A deploy deletes the old hashed chunks, so a stale tab fails to load the
  // next lazy route. That is proof of a new build — offer the reload at once,
  // even while snoozed, instead of leaving the user on a page that won't open.
  function onChunkError(): void {
    available.value = true
  }

  onMounted(() => {
    timer = setInterval(check, UPDATE_CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('vite:preloadError', onChunkError)
  })
  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('vite:preloadError', onChunkError)
  })

  return { available, check, later, reload }
}
