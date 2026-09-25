import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchOrganizationBranding } from '@/modules/organization/api/organization.api'
import type { OrganizationBranding } from '@/modules/organization/interfaces/organization.interface'

/** A center with no brand set stays on the default TalimPlus look. */
export const DEFAULT_BRAND_NAME = 'TalimPlus'
export const DEFAULT_LOGO = '/favicon.svg'
export const DEFAULT_FAVICON = '/favicon.svg'

/**
 * The organization's brand: name, logo, favicon. The domain is shared (SaaS), but
 * the cabinet's logo, tab title and favicon show each org's own. Loaded once when
 * the authenticated layout mounts; reset on logout. Secondary — if the fetch
 * fails the default look stays and the cabinet keeps working.
 */
export const useBrandingStore = defineStore('branding', () => {
  const branding = ref<OrganizationBranding | null>(null)
  const loaded = ref(false)

  const name = computed(() => branding.value?.name?.trim() || DEFAULT_BRAND_NAME)
  const logoUrl = computed(() => branding.value?.logoUrl || DEFAULT_LOGO)
  const faviconUrl = computed(() => branding.value?.faviconUrl || DEFAULT_FAVICON)

  /** Apply to the browser tab: title + favicon link. */
  function applyToDocument(): void {
    if (typeof document === 'undefined') return
    document.title = name.value
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = faviconUrl.value
  }

  function set(data: OrganizationBranding): void {
    branding.value = data
    loaded.value = true
    applyToDocument()
  }

  async function load(): Promise<void> {
    try {
      set(await fetchOrganizationBranding())
    } catch {
      loaded.value = true
    }
  }

  function reset(): void {
    branding.value = null
    loaded.value = false
    applyToDocument()
  }

  return { branding, loaded, name, logoUrl, faviconUrl, set, load, reset, applyToDocument }
})
