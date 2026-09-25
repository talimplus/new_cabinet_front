import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrganizationBranding, MAX_LOGO_BYTES } from '../use-organization-branding'
import { fetchOrganizationBranding, updateOrganizationBranding } from '../../api/organization.api'
import { useBrandingStore } from '@/stores/branding.store'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { OrganizationBranding } from '../../interfaces/organization.interface'

vi.mock('../../api/organization.api', () => ({
  fetchOrganizationBranding: vi.fn(),
  updateOrganizationBranding: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchOrganizationBranding)
const mockedUpdate = vi.mocked(updateOrganizationBranding)

function makeBranding(overrides: Partial<OrganizationBranding> = {}): OrganizationBranding {
  return {
    organizationId: 1,
    name: 'TalimPlus Andijon',
    logoUrl: 'data:image/png;base64,logo',
    faviconUrl: 'data:image/png;base64,fav',
    brandingUpdatedAt: '2026-09-24T00:00:00.000Z',
    ...overrides,
  }
}

describe('useOrganizationBranding', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('load()', () => {
    it('pulls from the branding store and fills the form; isDirty is false right after', async () => {
      const branding = makeBranding()
      mockedFetch.mockResolvedValueOnce(branding)
      const ob = useOrganizationBranding()

      await ob.load()

      expect(mockedFetch).toHaveBeenCalled()
      expect(ob.form.name).toBe(branding.name)
      expect(ob.form.logoUrl).toBe(branding.logoUrl)
      expect(ob.form.faviconUrl).toBe(branding.faviconUrl)
      expect(ob.isDirty.value).toBe(false)
    })

    it('does not re-fetch when the branding store is already loaded', async () => {
      const branding = makeBranding()
      const brandingStore = useBrandingStore()
      brandingStore.set(branding)

      const ob = useOrganizationBranding()
      await ob.load()

      expect(mockedFetch).not.toHaveBeenCalled()
      expect(ob.form.name).toBe(branding.name)
    })
  })

  describe('nameError', () => {
    it('is non-empty when the trimmed name is shorter than 2 chars', () => {
      const ob = useOrganizationBranding()
      ob.form.name = ' a '
      expect(ob.nameError.value).not.toBe('')

      ob.form.name = '  '
      expect(ob.nameError.value).not.toBe('')
    })

    it('is empty when the trimmed name has 2+ chars', () => {
      const ob = useOrganizationBranding()
      ob.form.name = 'Ok'
      expect(ob.nameError.value).toBe('')
    })
  })

  describe('isDirty', () => {
    it('flips true when any field changes after load', async () => {
      mockedFetch.mockResolvedValueOnce(makeBranding())
      const ob = useOrganizationBranding()
      await ob.load()
      expect(ob.isDirty.value).toBe(false)

      ob.form.name = 'Changed name'
      expect(ob.isDirty.value).toBe(true)
    })

    it('flips true on a logoUrl or faviconUrl change', async () => {
      mockedFetch.mockResolvedValueOnce(makeBranding())
      const ob = useOrganizationBranding()
      await ob.load()

      ob.form.logoUrl = 'data:image/png;base64,new-logo'
      expect(ob.isDirty.value).toBe(true)

      ob.reset()
      ob.form.faviconUrl = 'data:image/png;base64,new-fav'
      expect(ob.isDirty.value).toBe(true)
    })
  })

  describe('reset()', () => {
    it('restores the form to the loaded values and clears fileError', async () => {
      const branding = makeBranding()
      mockedFetch.mockResolvedValueOnce(branding)
      const ob = useOrganizationBranding()
      await ob.load()

      ob.form.name = 'Something else'
      ob.fileError.value = 'oops'

      ob.reset()

      expect(ob.form.name).toBe(branding.name)
      expect(ob.form.logoUrl).toBe(branding.logoUrl)
      expect(ob.form.faviconUrl).toBe(branding.faviconUrl)
      expect(ob.fileError.value).toBe('')
    })
  })

  describe('pickFile()', () => {
    it('sets fileError and does not change form.logoUrl when the file is too large', async () => {
      const ob = useOrganizationBranding()
      const before = ob.form.logoUrl
      const bigFile = new File([new Uint8Array(MAX_LOGO_BYTES + 1)], 'big.png', { type: 'image/png' })

      await ob.pickFile(bigFile, MAX_LOGO_BYTES, 'logoUrl')

      expect(ob.fileError.value).not.toBe('')
      expect(ob.form.logoUrl).toBe(before)
    })

    it('reads a within-limit file as a data URL into form.logoUrl', async () => {
      const ob = useOrganizationBranding()
      const smallFile = new File([new Uint8Array([1, 2, 3])], 'small.png', { type: 'image/png' })

      await ob.pickFile(smallFile, MAX_LOGO_BYTES, 'logoUrl')

      expect(ob.fileError.value).toBe('')
      expect(ob.form.logoUrl.startsWith('data:image/png;base64,')).toBe(true)
    })
  })

  describe('save()', () => {
    it('does nothing when nameError is set', async () => {
      const ob = useOrganizationBranding()
      ob.form.name = 'a'

      await ob.save()

      expect(mockedUpdate).not.toHaveBeenCalled()
    })

    it('saves the trimmed name + urls, notifies success, and updates the branding store', async () => {
      const ob = useOrganizationBranding()
      ob.form.name = '  Yangi nom  '
      ob.form.logoUrl = 'data:image/png;base64,logo'
      ob.form.faviconUrl = 'data:image/png;base64,fav'
      const saved = makeBranding({ name: 'Yangi nom' })
      mockedUpdate.mockResolvedValueOnce(saved)

      await ob.save()

      expect(mockedUpdate).toHaveBeenCalledWith({
        name: 'Yangi nom',
        logoUrl: 'data:image/png;base64,logo',
        faviconUrl: 'data:image/png;base64,fav',
      })

      const notify = useNotificationStore()
      expect(notify.items).toHaveLength(1)
      expect(notify.items[0]!.type).toBe(NotificationType.SUCCESS)

      const brandingStore = useBrandingStore()
      expect(brandingStore.branding).toEqual(saved)
    })
  })
})
