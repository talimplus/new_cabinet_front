import { http } from '@/shared/api/http'
import type {
  OrganizationBranding,
  OrganizationBrandingForm,
} from '../interfaces/organization.interface'

/** GET /organizations/branding — open; returns the org's brand. */
export async function fetchOrganizationBranding(): Promise<OrganizationBranding> {
  const { data } = await http.get<OrganizationBranding>('/organizations/branding')
  return data
}

/** PUT /organizations/branding — requires `organization.settings`. */
export async function updateOrganizationBranding(
  form: OrganizationBrandingForm,
): Promise<OrganizationBranding> {
  const { data } = await http.put<OrganizationBranding>('/organizations/branding', form)
  return data
}
