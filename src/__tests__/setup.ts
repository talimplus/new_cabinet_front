import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import i18n from '@/locales'

// Every component may call $t — install the real messages so specs assert on
// the same Uzbek strings the app renders (no stub translations).
config.global.plugins = [i18n]

// jsdom has no matchMedia; the theme composable relies on it.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
