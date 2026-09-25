import { http } from '@/shared/api/http'
import type { Profile, ProfileForm } from '../interfaces/profile.interface'

/** GET /users/me — the signed-in user's own profile. */
export async function fetchMyProfile(): Promise<Profile> {
  const { data } = await http.get<Profile>('/users/me')
  return data
}

/** PUT /users/me — update own profile; returns the fresh profile. */
export async function updateMyProfile(form: ProfileForm): Promise<Profile> {
  const { data } = await http.put<Profile>('/users/me', form)
  return data
}
