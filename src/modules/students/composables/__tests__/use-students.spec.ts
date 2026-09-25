import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useStudents } from '../use-students'
import {
  fetchStudents as fetchStudentsApi,
  createStudent as createStudentApi,
  updateStudent as updateStudentApi,
  changeStudentStatus as changeStudentStatusApi,
} from '../../api/students.api'
import { fetchSubjects as fetchSubjectsApi } from '@/modules/subjects/api/subjects.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { StudentStatus } from '../../enums/student-status.enum'
import { ReturnLikelihood } from '../../enums/return-likelihood.enum'
import type { Student } from '../../interfaces/student.interface'

vi.mock('../../api/students.api', () => ({
  fetchStudents: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  changeStudentStatus: vi.fn(),
}))
vi.mock('@/modules/subjects/api/subjects.api', () => ({
  fetchSubjects: vi.fn(),
}))

const mockedFetchStudents = vi.mocked(fetchStudentsApi)
const mockedCreateStudent = vi.mocked(createStudentApi)
const mockedUpdateStudent = vi.mocked(updateStudentApi)
const mockedChangeStatus = vi.mocked(changeStudentStatusApi)
const mockedFetchSubjects = vi.mocked(fetchSubjectsApi)


function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 1,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '998901112233',
    status: StudentStatus.NEW,
    ...overrides,
  }
}

describe('useStudents', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Give the scope store an active center so load()/loadSubjects() run.
    mockedFetchStudents.mockResolvedValue({
      data: [makeStudent()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 3 },
    })
    mockedFetchSubjects.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, perPage: 100, totalPages: 1 },
    })
    mockedChangeStatus.mockResolvedValue(undefined)
  })

  describe('load()', () => {
    it('builds params from the status getter + center and strips empty filters', async () => {
      const s = useStudents(() => StudentStatus.ACTIVE)
      // applyFilters() triggers load() without going through init()/loadCenters().
      s.applyFilters()
      await flushPromises()

      expect(mockedFetchStudents).toHaveBeenCalledWith({
        status: StudentStatus.ACTIVE,
        page: 1,
        perPage: 10,
        search: undefined,
        subjectId: undefined,
        preferredTime: undefined,
        preferredDays: undefined,
        returnLikelihood: undefined,
      })
      expect(s.rows.value).toHaveLength(1)
      expect(s.totalPages.value).toBe(3)
    })

    it('passes non-empty filters through', async () => {
      const s = useStudents(() => StudentStatus.NEW)
      s.filters.search = 'ali'
      s.filters.subjectId = 3
      s.filters.returnLikelihood = ReturnLikelihood.MAYBE
      await s.setPage(2)
      await flushPromises()

      expect(mockedFetchStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: StudentStatus.NEW,
          page: 2,
          search: 'ali',
          subjectId: 3,
          returnLikelihood: ReturnLikelihood.MAYBE,
        }),
      )
    })
  })

  describe('submit()', () => {
    it('creates a new student when not editing, then notifies and closes the modal', async () => {
      const s = useStudents(() => StudentStatus.NEW)
      s.openCreate()
      mockedCreateStudent.mockResolvedValueOnce(makeStudent({ id: 99 }))

      await s.submit({ firstName: 'Ali', lastName: 'Valiyev', phone: '998901112233' })
      await flushPromises()

      expect(mockedCreateStudent).toHaveBeenCalledWith({
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
      })
      expect(mockedUpdateStudent).not.toHaveBeenCalled()
      expect(s.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing student WITHOUT the status key', async () => {
      const s = useStudents(() => StudentStatus.NEW)
      const editing = makeStudent({ id: 42 })
      s.openEdit(editing)
      mockedUpdateStudent.mockResolvedValueOnce(editing)

      await s.submit({
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
        status: StudentStatus.ACTIVE,
      })
      await flushPromises()

      expect(mockedCreateStudent).not.toHaveBeenCalled()
      expect(mockedUpdateStudent).toHaveBeenCalledTimes(1)
      const [id, body] = mockedUpdateStudent.mock.calls[0]!
      expect(id).toBe(42)
      expect('status' in body).toBe(false)
      expect(body).toEqual({
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
      })
    })
  })

  describe('requestStatus()', () => {
    it('refuses to activate a student with no groups and pushes an error', () => {
      const s = useStudents(() => StudentStatus.NEW)
      const student = makeStudent({ groupIds: [] })

      s.requestStatus(student, StudentStatus.ACTIVE)

      expect(mockedChangeStatus).not.toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.ERROR)).toBe(true)
    })

    it('activates immediately when the student has groups', async () => {
      const s = useStudents(() => StudentStatus.NEW)
      const student = makeStudent({ groupIds: [1] })

      s.requestStatus(student, StudentStatus.ACTIVE)
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(student.id, StudentStatus.ACTIVE, undefined)
    })

    it('opens the return dialog for STOPPED/IGNORED instead of calling the api', () => {
      const s = useStudents(() => StudentStatus.ACTIVE)
      const student = makeStudent()

      s.requestStatus(student, StudentStatus.STOPPED)

      expect(mockedChangeStatus).not.toHaveBeenCalled()
      expect(s.returnDialog.open).toBe(true)
      expect(s.returnDialog.student).toEqual(student)
      expect(s.returnDialog.status).toBe(StudentStatus.STOPPED)
    })
  })

  describe('confirmReturn()', () => {
    it('changes the status with the payload and closes the dialog', async () => {
      const s = useStudents(() => StudentStatus.ACTIVE)
      const student = makeStudent()
      s.requestStatus(student, StudentStatus.STOPPED)

      const payload = { returnLikelihood: ReturnLikelihood.MAYBE, comment: 'keyin qaytadi' }
      await s.confirmReturn(payload)
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(student.id, StudentStatus.STOPPED, payload)
      expect(s.returnDialog.open).toBe(false)
    })
  })
})
