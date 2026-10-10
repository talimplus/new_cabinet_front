/// <reference types="vite/client" />

import 'vue-router'
import type { Permission } from '@/shared/enums/permission.enum'

declare global {
  /** Build id from `vite.config.ts`; matches `version.json` of the same build. */
  const __APP_VERSION__: string
}

declare module 'vue-router' {
  interface RouteMeta {
    /** i18n key for the header title — never a literal. */
    titleKey?: string
    /** OR list; holding any one key opens the page. Absent = open. */
    permission?: Permission[]
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}
