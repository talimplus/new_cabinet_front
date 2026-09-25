import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, logout, fetchMe, register } from '../auth.api'
import { http } from '@/shared/api/http'
import { UserRole } from '@/shared/enums/user-role.enum'

// Mock the shared axios instance — API tests never hit the network.
vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('auth.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login posts credentials and returns the parsed body', async () => {
    const body = {
      access_token: 'jwt',
      user: { id: 1, email: 'a@b.uz', role: UserRole.ADMIN, centerId: 2, roleId: 2, roleName: 'Administrator', permissions: ['*'] },
    }
    mockedHttp.post.mockResolvedValueOnce({ data: body })

    const result = await login({ email: 'a@b.uz', password: 'secret' })

    expect(mockedHttp.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'a@b.uz', password: 'secret' },
      { skipGlobalError: true },
    )
    expect(result).toEqual(body)
  })

  it('fetchMe returns response.data', async () => {
    const body = {
      user: {
        id: 1, email: 'a@b.uz', role: UserRole.TEACHER, centerId: null,
        roleId: 5, roleName: "O'qituvchi", permissions: ['teacher.today'],
      },
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    expect(await fetchMe()).toEqual(body)
    expect(mockedHttp.get).toHaveBeenCalledWith('/auth/me')
  })

  it('register posts the form body and resolves void', async () => {
    const form = {
      organizationName: 'Acme',
      centerName: 'Center 1',
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '901234567',
      password: 'secret6',
      email: 'a@b.uz',
      login: 'a@b.uz',
    }
    mockedHttp.post.mockResolvedValueOnce({ data: undefined })

    await expect(register(form)).resolves.toBeUndefined()
    expect(mockedHttp.post).toHaveBeenCalledWith('/auth/register', form)
  })

  it('logout calls the endpoint', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: undefined })
    await logout()
    expect(mockedHttp.post).toHaveBeenCalledWith('/auth/logout')
  })
})
