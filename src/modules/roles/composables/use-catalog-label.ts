import { useI18n } from 'vue-i18n'
import { AppLocale } from '@/shared/enums/app-locale.enum'
import type { PermissionLabel } from '../interfaces/permission-group.interface'

/**
 * Picks the catalog label for the active language. The backend ships both uz
 * and ru, so nothing is translated locally — a key it adds tomorrow renders
 * correctly with no frontend change.
 */
export function useCatalogLabel() {
  const { locale } = useI18n()
  const catalogLabel = (label: PermissionLabel): string =>
    locale.value === AppLocale.RU ? label.ru : label.uz
  return { catalogLabel }
}
