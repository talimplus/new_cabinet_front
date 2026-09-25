import { http } from '@/shared/api/http'
import type { Center, CaptureIpResponse } from '../interfaces/center.interface'
import type { CenterForm } from '../interfaces/center-form.interface'
import type { CentersParams } from '../interfaces/center-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export async function fetchCenters(params?: CentersParams): Promise<PaginatedResponse<Center>> {
  const { data } = await http.get<PaginatedResponse<Center>>('/centers', { params })
  return data
}

/** Unpaginated list for dropdowns / center scoping (docs §4.2). */
export async function fetchAllCenters(): Promise<Center[]> {
  const { data } = await http.get<Center[]>('/centers/all')
  return data
}

export async function createCenter(form: CenterForm): Promise<Center> {
  const { data } = await http.post<Center>('/centers', form)
  return data
}

export async function updateCenter(id: number, form: CenterForm): Promise<Center> {
  const { data } = await http.put<Center>(`/centers/${id}`, form)
  return data
}

export async function deleteCenter(id: number): Promise<void> {
  await http.delete(`/centers/${id}`)
}

/**
 * POST /centers/:id/capture-ip — records the request's external IP as the
 * center's Wi-Fi IP. Pressed while standing in the center on its network, so the
 * most reliable staff-attendance anchor (docs §5).
 */
export async function captureCenterIp(id: number): Promise<CaptureIpResponse> {
  // The composable owns the error message (why the capture failed), so the
  // global interceptor toast is suppressed to avoid a duplicate.
  const { data } = await http.post<CaptureIpResponse>(`/centers/${id}/capture-ip`, undefined, {
    skipGlobalError: true,
  })
  return data
}
