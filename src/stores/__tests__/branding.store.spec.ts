import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  useBrandingStore,
  DEFAULT_BRAND_NAME,
  DEFAULT_LOGO,
  DEFAULT_FAVICON,
} from '../branding.store'
import { fetchOrganizationBranding } from '@/modules/organization/api/organization.api'
import type { OrganizationBranding } from '@/modules/organization/interfaces/organization.interface'

vi.mock('@/modules/organization/api/organization.api', () => ({
  fetchOrganizationBranding: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchOrganizationBranding)

function makeBranding(overrides: Partial<OrganizationBranding> = {}): OrganizationBranding {
  return {
    organizationId: 1,
    name: 'TalimPlus Andijon',
    logoUrl: 'data:image/png;base64,abc',
    faviconUrl: 'data:image/png;base64,def',
    brandingUpdatedAt: '2026-09-24T00:00:00.000Z',
    ...overrides,
  }
}

describe('branding store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    document
      .querySelectorAll('link[rel~="icon"]')
      .forEach((link) => link.parentNode?.removeChild(link))
  })

  it('exposes the default brand before anything loads', () => {
    const store = useBrandingStore()

    expect(store.branding).toBeNull()
    expect(store.loaded).toBe(false)
    expect(store.name).toBe(DEFAULT_BRAND_NAME)
    expect(store.name).toBe('TalimPlus')
    expect(store.logoUrl).toBe(DEFAULT_LOGO)
    expect(store.logoUrl).toBe('/favicon.svg')
    expect(store.faviconUrl).toBe(DEFAULT_FAVICON)
    expect(store.faviconUrl).toBe('/favicon.svg')
  })

  describe('set()', () => {
    it('stores the branding, flips loaded, and reflects it in the computed getters', () => {
      const store = useBrandingStore()
      const branding = makeBranding()

      store.set(branding)

      expect(store.branding).toEqual(branding)
      expect(store.loaded).toBe(true)
      expect(store.name).toBe(branding.name)
      expect(store.logoUrl).toBe(branding.logoUrl)
      expect(store.faviconUrl).toBe(branding.faviconUrl)
    })

    it('trims the name and falls back to the default when it is blank', () => {
      const store = useBrandingStore()
      store.set(makeBranding({ name: '   ' }))
      expect(store.name).toBe(DEFAULT_BRAND_NAME)

      store.set(makeBranding({ name: '  Padded Name  ' }))
      expect(store.name).toBe('Padded Name')
    })

    it('falls back to the default logo/favicon when null', () => {
      const store = useBrandingStore()
      store.set(makeBranding({ logoUrl: null, faviconUrl: null }))

      expect(store.logoUrl).toBe(DEFAULT_LOGO)
      expect(store.faviconUrl).toBe(DEFAULT_FAVICON)
    })
  })

  describe('load()', () => {
    it('calls fetchOrganizationBranding and sets branding on success', async () => {
      const branding = makeBranding()
      mockedFetch.mockResolvedValueOnce(branding)
      const store = useBrandingStore()

      await store.load()

      expect(mockedFetch).toHaveBeenCalled()
      expect(store.branding).toEqual(branding)
      expect(store.loaded).toBe(true)
    })

    it('does not throw and still flips loaded when the fetch rejects, keeping defaults', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('network down'))
      const store = useBrandingStore()

      await expect(store.load()).resolves.toBeUndefined()

      expect(store.loaded).toBe(true)
      expect(store.branding).toBeNull()
      expect(store.name).toBe(DEFAULT_BRAND_NAME)
      expect(store.logoUrl).toBe(DEFAULT_LOGO)
      expect(store.faviconUrl).toBe(DEFAULT_FAVICON)
    })
  })

  describe('reset()', () => {
    it('clears branding and flips loaded back to false', () => {
      const store = useBrandingStore()
      store.set(makeBranding())

      store.reset()

      expect(store.branding).toBeNull()
      expect(store.loaded).toBe(false)
      expect(store.name).toBe(DEFAULT_BRAND_NAME)
    })
  })

  describe('applyToDocument()', () => {
    it('sets document.title and the favicon link href to the defaults when there is no branding', () => {
      const store = useBrandingStore()

      store.applyToDocument()

      expect(document.title).toBe(DEFAULT_BRAND_NAME)
      const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
      expect(link).not.toBeNull()
      expect(link?.getAttribute('href')).toBe(DEFAULT_FAVICON)
    })

    it('sets document.title and creates/updates the favicon link on set()', () => {
      const store = useBrandingStore()
      const branding = makeBranding({ name: 'Andijon filiali', faviconUrl: 'data:image/png;base64,fav' })

      store.set(branding)

      expect(document.title).toBe('Andijon filiali')
      const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
      expect(links).toHaveLength(1)
      expect(links[0]!.getAttribute('href')).toBe('data:image/png;base64,fav')
    })

    it('reuses the existing link element instead of creating a new one each call', () => {
      const store = useBrandingStore()
      store.set(makeBranding({ faviconUrl: 'data:image/png;base64,one' }))
      store.set(makeBranding({ faviconUrl: 'data:image/png;base64,two' }))

      const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
      expect(links).toHaveLength(1)
      expect(links[0]!.getAttribute('href')).toBe('data:image/png;base64,two')
    })
  })
})
