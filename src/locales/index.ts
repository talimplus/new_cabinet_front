import { createI18n } from 'vue-i18n'
import { AppLocale } from '@/shared/enums/app-locale.enum'
import { messages } from './messages'

export const LOCALE_STORAGE_KEY = 'locale'

/** The stored choice, or Uzbek. Storage can throw in private mode — never fatal. */
export function readStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === AppLocale.RU || stored === AppLocale.UZ) return stored
  } catch {
    /* storage unavailable */
  }
  return AppLocale.UZ
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: readStoredLocale(),
  fallbackLocale: AppLocale.UZ,
  // Uzbek keys are the source of truth; a missing ru key falls back silently.
  missingWarn: false,
  fallbackWarn: false,
  messages,
})

/** Switch the UI language, persist it and keep `<html lang>` in sync. */
export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* storage unavailable */
  }
  document.documentElement.setAttribute('lang', locale)
}

/** The active locale, for code that runs outside a component setup. */
export function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale
}

/** Translate outside a component (stores, composables, config builders). */
export const t = i18n.global.t

export default i18n
