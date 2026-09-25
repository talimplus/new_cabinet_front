import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchEmployees, fetchUsers, createUser, updateUser, deleteUser } from '../users.api'
import { http } from '@/shared/api/http'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { User } from '../../interfaces/user.interface'
import type { UserForm } from '../../interfaces/user-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const form: UserForm = {
  firstName: 'Ali',
  lastName: 'Valiyev',
  login: 'ali12345',
  phone: '998001234567',
  password: 'secret123',
  roleId: 11,
  centerId: 2,
  salary: 2000000,
  commissionPercentage: 40,
}

describe('users.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchEmployees GETs /users/employees with params and returns the paginated body', async () => {
    const body = {
      data: [{ id: 1, firstName: 'Ali', lastName: 'Valiyev', role: UserRole.TEACHER }],
      meta: { total: 1, page: 1 },
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchEmployees({ centerId: 2, page: 1, perPage: 100 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/users/employees', {
      params: { centerId: 2, page: 1, perPage: 100 },
    })
    expect(result).toEqual(body)
  })

  it('fetchUsers GETs /users/employees with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, firstName: 'Ali' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchUsers({ centerId: 2, name: 'ali', phone: '998', page: 1, perPage: 10 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/users/employees', {
      params: { centerId: 2, name: 'ali', phone: '998', page: 1, perPage: 10 },
    })
    expect(result).toEqual(body)
  })

  it('createUser POSTs the form to /users and returns the created user', async () => {
    const created = { id: 10, firstName: 'Ali' } as User
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createUser(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/users', form)
    expect(result).toEqual(created)
  })

  it('updateUser PUTs the form to /users/{id} and returns the updated user', async () => {
    const updated = { id: 5, firstName: 'Ali' } as User
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateUser(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/users/5', form)
    expect(result).toEqual(updated)
  })

  it('deleteUser DELETEs /users/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteUser(7)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/users/7')
  })
})
