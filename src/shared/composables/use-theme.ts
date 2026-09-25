import { computed, ref } from 'vue'
import { ThemeMode } from '@/shared/enums/theme-mode.enum'

const STORAGE_KEY = 'theme'

/**
 * App theme controller (light / dark / system).
 *
 * - Persists the chosen mode in localStorage under `theme`.
 * - When mode is `system`, follows the OS `prefers-color-scheme` and reacts to
 *   changes live.
 * - Applies the resolved theme by toggling the `.dark` class on <html>, which
 *   is what the CSS tokens in `assets/main.css` key off.
 *
 * Module-level state = a single shared instance across the app.
 */
const mode = ref<ThemeMode>(readStoredMode())
const systemPrefersDark = ref(false)

/** True when the currently *resolved* theme is dark. */
const isDark = computed(() =>
  mode.value === ThemeMode.SYSTEM
    ? systemPrefersDark.value
    : mode.value === ThemeMode.DARK,
)

function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return ThemeMode.SYSTEM
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === ThemeMode.LIGHT ||
    stored === ThemeMode.DARK ||
    stored === ThemeMode.SYSTEM
    ? (stored as ThemeMode)
    : ThemeMode.SYSTEM
}

function mediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null
  return window.matchMedia('(prefers-color-scheme: dark)')
}

function applyToDom(): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', isDark.value)
}

function setMode(next: ThemeMode): void {
  mode.value = next
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
  applyToDom()
}

/** Flip between light and dark (resolving `system` to its current value first). */
function toggle(): void {
  setMode(isDark.value ? ThemeMode.LIGHT : ThemeMode.DARK)
}

let initialized = false

/**
 * Wire up system-preference tracking and apply the initial theme.
 * Safe to call more than once; only the first call registers listeners.
 * Call once on app start (e.g. in `main.ts`).
 */
function initTheme(): void {
  const mq = mediaQuery()
  systemPrefersDark.value = mq?.matches ?? false
  applyToDom()

  if (initialized || !mq) return
  initialized = true
  mq.addEventListener('change', (e) => {
    systemPrefersDark.value = e.matches
    if (mode.value === ThemeMode.SYSTEM) applyToDom()
  })
}

export function useTheme() {
  return { mode, isDark, setMode, toggle, initTheme }
}
