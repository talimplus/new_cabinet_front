/**
 * The permission catalog from `GET /roles/permissions` — 18 groups / 67 keys.
 *
 * Labels arrive **already translated** (uz + ru) from the backend, which is the
 * single source of truth: never re-translate them locally, or a key the backend
 * adds would render blank here.
 */
export interface PermissionLabel {
  uz: string
  ru: string
}

export interface PermissionCatalogItem {
  key: string
  label: PermissionLabel
}

export interface PermissionGroup {
  key: string
  label: PermissionLabel
  permissions: PermissionCatalogItem[]
}
