import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMyProfile, updateMyProfile } from '../profile.api'
import { http } from '@/shared/api/http'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Profile } from '../../interfaces/profile.interface'
import type { ProfileForm } from '../../interfaces/profile.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const profile: Profile = {
  id: 1,
  firstName: 'Ali',
  lastName: 'Valiyev',
  login: 'ali',
  phone: '998901112233',
  role: UserRole.TEACHER,
  roleName: "O'qituvchi",
  salary: 2000000,
  commissionPercentage: 40,
}

const form: ProfileForm = {
  firstName: 'Ali',
  lastName: 'Valiyev',
  login: 'ali',
  phone: '998901112233',
}

describe('profile.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchMyProfile GETs /users/me and returns the body', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: profile })

    const result = await fetchMyProfile()

    expect(mockedHttp.get).toHaveBeenCalledWith('/users/me')
    expect(result).toEqual(profile)
  })

  it('updateMyProfile PUTs the form to /users/me and returns the updated profile', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: profile })

    const result = await updateMyProfile(form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/users/me', form)
    expect(result).toEqual(profile)
  })

  it('updateMyProfile sends a trimmed password when provided', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: profile })
    const formWithPassword: ProfileForm = { ...form, password: 'secret123' }

    await updateMyProfile(formWithPassword)

    expect(mockedHttp.put).toHaveBeenCalledWith('/users/me', formWithPassword)
  })
})
