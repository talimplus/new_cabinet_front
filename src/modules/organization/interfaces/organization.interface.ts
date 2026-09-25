/**
 * Organization branding — the cabinet's name, logo and favicon
 * (`GET`/`PUT /organizations/branding`, verified live 2026-09-24). The domain is
 * shared across the SaaS; only the display name, logo and favicon are per-org.
 * `logoUrl` / `faviconUrl` are a `data:image/...;base64,...` URL or `https://…`;
 * `null`/empty falls back to the default TalimPlus brand.
 */
export interface OrganizationBranding {
  organizationId: number
  name: string
  logoUrl: string | null
  faviconUrl: string | null
  brandingUpdatedAt: string | null
}

/** `PUT /organizations/branding` body. Empty string on a url removes that image. */
export interface OrganizationBrandingForm {
  name?: string
  logoUrl?: string | null
  faviconUrl?: string | null
}
