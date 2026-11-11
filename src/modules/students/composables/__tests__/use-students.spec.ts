import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useStudents } from '../use-students'
import {
  fetchStudents as fetchStudentsApi,
  createStudent as createStudentApi,
  updateStudent as updateStudentApi,
  changeStudentStatus as changeStudentStatusApi,
  previewStudentStartDate as previewStudentStartDateApi,
} from '../../api/students.api'
import { StudentStartMode } from '../../enums/student-start-mode.enum'
import { toDateString } from '@/shared/utils/format-date'
import { fetchSubjects as fetchSubjectsApi } from '@/modules/subjects/api/subjects.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { StudentStatus } from '../../enums/student-status.enum'
import { ReturnLikelihood } from '../../enums/return-likelihood.enum'
import type { Student } from '../../interfaces/student.interface'

// Status changes ask "are you sure?" first — these specs confirm right away.
vi.mock('@/shared/composables/use-status-confirm', () => ({
  useStatusConfirm: () => () => Promise.resolve(true),
}))
vi.mock('../../api/students.api', () => ({
  fetchStudents: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  changeStudentStatus: vi.fn(),
  previewStudentStartDate: vi.fn(),
}))
vi.mock('@/modules/subjects/api/subjects.api', () => ({
  fetchSubjects: vi.fn(),
}))

const mockedFetchStudents = vi.mocked(fetchStudentsApi)
const mockedCreateStudent = vi.mocked(createStudentApi)
const mockedUpdateStudent = vi.mocked(updateStudentApi)
const mockedChangeStatus = vi.mocked(changeStudentStatusApi)
const mockedFetchSubjects = vi.mocked(fetchSubjectsApi)
const mockedPreview = vi.mocked(previewStudentStartDateApi)
const emptyPreview = {
  startDate: '2026-10-12',
  rows: [],
  totals: { debtIncrease: 0, debtDecrease: 0, refund: 0 },
  paidSalaryMonths: [],
}


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
    mockedPreview.mockResolvedValue(emptyPreview)
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

    it('first activation opens the start-date dialog (today) and activates on confirm', async () => {
      const s = useStudents(() => StudentStatus.NEW)
      const student = makeStudent({ groupIds: [1] })

      s.requestStatus(student, StudentStatus.ACTIVE)
      await flushPromises()

      expect(mockedChangeStatus).not.toHaveBeenCalled()
      expect(s.start.state.open).toBe(true)
      expect(s.start.state.mode).toBe(StudentStartMode.ACTIVATE)
      // Today moves nothing backwards — no preview needed.
      expect(mockedPreview).not.toHaveBeenCalled()

      await s.start.confirm()
      await flushPromises()
      expect(mockedChangeStatus).toHaveBeenCalledWith(student.id, StudentStatus.ACTIVE, {
        startDate: toDateString(new Date()),
      })
      expect(s.start.state.open).toBe(false)
    })

    it('a past activation date is previewed and sent', async () => {
      const s = useStudents(() => StudentStatus.NEW)
      const student = makeStudent({ id: 4, groupIds: [1] })
      s.requestStatus(student, StudentStatus.ACTIVE)
      s.start.setDate(new Date(2026, 9, 12))
      await flushPromises()

      expect(mockedPreview).toHaveBeenCalledWith(4, { startDate: '2026-10-12', groupIds: undefined })
      await s.start.confirm()
      await flushPromises()
      expect(mockedChangeStatus).toHaveBeenCalledWith(4, StudentStatus.ACTIVE, { startDate: '2026-10-12' })
    })

    it('a failed activation keeps the dialog open', async () => {
      mockedChangeStatus.mockRejectedValueOnce(new Error('boom'))
      const s = useStudents(() => StudentStatus.NEW)
      s.requestStatus(makeStudent({ groupIds: [1] }), StudentStatus.ACTIVE)
      await s.start.confirm()
      await flushPromises()
      expect(s.start.state.open).toBe(true)
    })

    it('a returning (stopped) student is activated without the dialog', async () => {
      const s = useStudents(() => StudentStatus.STOPPED)
      const student = makeStudent({ status: StudentStatus.STOPPED, groupIds: [1] })

      s.requestStatus(student, StudentStatus.ACTIVE)
      await flushPromises()

      expect(s.start.state.open).toBe(false)
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

  describe('join date for added groups', () => {
    it('an edit with a past groupJoinedAt previews the added groups and saves on confirm', async () => {
      mockedUpdateStudent.mockResolvedValue(makeStudent())
      const s = useStudents(() => StudentStatus.ACTIVE)
      s.openEdit(makeStudent({ id: 9, status: StudentStatus.ACTIVE, groupIds: [1] }))
      const form = { firstName: 'Ali', lastName: 'V', phone: '+998901112233', groupIds: [1, 2], groupJoinedAt: '2026-10-15' }

      await s.submit(form)
      await flushPromises()

      expect(mockedUpdateStudent).not.toHaveBeenCalled()
      expect(s.start.state.mode).toBe(StudentStartMode.JOIN)
      expect(mockedPreview).toHaveBeenCalledWith(9, { startDate: '2026-10-15', groupIds: [2] })

      await s.start.confirm()
      await flushPromises()
      expect(mockedUpdateStudent).toHaveBeenCalledWith(9, form)
      expect(s.modalOpen.value).toBe(false)
    })

    it('a 422 on the confirmed edit goes back to the form', async () => {
      const error = { response: { status: 422, data: { errors: { groupJoinedAt: ['x'] } } } }
      mockedUpdateStudent.mockRejectedValueOnce(error)
      const onEditError = vi.fn()
      const s = useStudents(() => StudentStatus.ACTIVE, onEditError)
      s.openEdit(makeStudent({ id: 9, groupIds: [1] }))
      await s.submit({ firstName: 'A', lastName: 'B', phone: '+998901112233', groupIds: [1, 2], groupJoinedAt: '2026-10-15' })
      await flushPromises()
      await s.start.confirm()
      await flushPromises()

      expect(onEditError).toHaveBeenCalledWith(error)
      expect(s.start.state.open).toBe(false)
      expect(s.modalOpen.value).toBe(true)
    })
  })
})
