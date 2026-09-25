/// <reference types="vite/client" />

import 'vue-router'
import type { Permission } from '@/shared/enums/permission.enum'

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
