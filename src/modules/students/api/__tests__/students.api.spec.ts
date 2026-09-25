import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchStudents,
  fetchStudentById,
  fetchAllStudents,
  createStudent,
  updateStudent,
  changeStudentStatus,
} from '../students.api'
import { http } from '@/shared/api/http'
import { StudentStatus } from '../../enums/student-status.enum'
import { ReturnLikelihood } from '../../enums/return-likelihood.enum'
import type { Student, StudentDetail } from '../../interfaces/student.interface'
import type { StudentForm } from '../../interfaces/student-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const form: StudentForm = {
  firstName: 'Ali',
  lastName: 'Valiyev',
  phone: '+998901234567',
  centerId: 1,
  status: StudentStatus.NEW,
}

describe('students.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchStudents GETs /students with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, firstName: 'Ali' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchStudents({
      centerId: 1,
      status: StudentStatus.ACTIVE,
      page: 1,
      perPage: 20,
    })

    expect(mockedHttp.get).toHaveBeenCalledWith('/students', {
      params: { centerId: 1, status: StudentStatus.ACTIVE, page: 1, perPage: 20 },
    })
    expect(result).toEqual(body)
  })

  it('fetchStudentById GETs /students/{id} and returns the expanded detail record', async () => {
    const detail: StudentDetail = {
      id: 29,
      firstName: 'TestEdited',
      lastName: 'Claude',
      phone: '+998960533321',
      status: StudentStatus.ACTIVE,
      groups: [{ id: 14, name: 'Guruh 266227', monthlyFee: '500000' }],
      center: { id: 4, name: 'Markaz 1' },
    }
    mockedHttp.get.mockResolvedValueOnce({ data: detail })

    const result = await fetchStudentById(29)

    expect(mockedHttp.get).toHaveBeenCalledWith('/students/29')
    expect(result).toEqual(detail)
    expect(result.groups?.[0]).toEqual({ id: 14, name: 'Guruh 266227', monthlyFee: '500000' })
    expect(result.center).toEqual({ id: 4, name: 'Markaz 1' })
  })

  it('fetchAllStudents GETs /students/all with the centerId param and returns the list', async () => {
    const list = [{ id: 1, firstName: 'Ali' }] as Student[]
    mockedHttp.get.mockResolvedValueOnce({ data: list })

    const result = await fetchAllStudents(9)

    expect(mockedHttp.get).toHaveBeenCalledWith('/students/all', { params: { centerId: 9 } })
    expect(result).toEqual(list)
  })

  it('fetchAllStudents passes undefined centerId when omitted', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [] })

    await fetchAllStudents()

    expect(mockedHttp.get).toHaveBeenCalledWith('/students/all', {
      params: { centerId: undefined },
    })
  })

  it('createStudent POSTs the form to /students and returns the created student', async () => {
    const created = { id: 10, firstName: 'Ali' } as Student
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createStudent(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/students', form)
    expect(result).toEqual(created)
  })

  it('updateStudent PUTs the form to /students/{id} and returns the updated student', async () => {
    const updated = { id: 5, firstName: 'Ali' } as Student
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateStudent(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/students/5', form)
    expect(result).toEqual(updated)
  })

  it('changeStudentStatus PUTs /students/change-status/{id} with body and status query param', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    const body = { returnLikelihood: ReturnLikelihood.MAYBE, comment: 'Called back' }
    await changeStudentStatus(3, StudentStatus.STOPPED, body)

    expect(mockedHttp.put).toHaveBeenCalledWith('/students/change-status/3', body, {
      params: { status: StudentStatus.STOPPED },
    })
  })

  it('changeStudentStatus sends an empty body when none is provided', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await changeStudentStatus(7, StudentStatus.ACTIVE)

    expect(mockedHttp.put).toHaveBeenCalledWith(
      '/students/change-status/7',
      {},
      { params: { status: StudentStatus.ACTIVE } },
    )
  })
})
