import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchOrganizationBranding, updateOrganizationBranding } from '../organization.api'
import { http } from '@/shared/api/http'
import type { OrganizationBranding, OrganizationBrandingForm } from '../../interfaces/organization.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const branding: OrganizationBranding = {
  organizationId: 1,
  name: 'TalimPlus Andijon',
  logoUrl: 'data:image/png;base64,abc',
  faviconUrl: 'data:image/png;base64,def',
  brandingUpdatedAt: '2026-09-24T00:00:00.000Z',
}

describe('organization.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchOrganizationBranding GETs /organizations/branding and returns the body', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: branding })

    const result = await fetchOrganizationBranding()

    expect(mockedHttp.get).toHaveBeenCalledWith('/organizations/branding')
    expect(result).toEqual(branding)
  })

  it('updateOrganizationBranding PUTs the form to /organizations/branding and returns the body', async () => {
    const form: OrganizationBrandingForm = {
      name: 'TalimPlus Andijon',
      logoUrl: 'data:image/png;base64,abc',
      faviconUrl: 'data:image/png;base64,def',
    }
    mockedHttp.put.mockResolvedValueOnce({ data: branding })

    const result = await updateOrganizationBranding(form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/organizations/branding', form)
    expect(result).toEqual(branding)
  })
})
