import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStaffAttendance } from '../use-staff-attendance'
import {
  fetchStaffAttendance,
  fetchStaffAttendanceReport,
  createManualAttendance,
  confirmStaffAttendance,
  deleteStaffAttendance,
} from '../../api/staff-attendance.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { useNotificationStore } from '@/stores/notification.store'
import { useUserStore } from '@/stores/user.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { t } from '@/locales'
import type { StaffAttendance } from '@/shared/interfaces/staff-attendance.interface'
import type { StaffAttendanceReport } from '../../interfaces/staff-attendance-report.interface'
import type { Employee } from '@/modules/users/interfaces/employee.interface'

vi.mock('../../api/staff-attendance.api', () => ({
  fetchStaffAttendance: vi.fn(),
  fetchStaffAttendanceReport: vi.fn(),
  createManualAttendance: vi.fn(),
  confirmStaffAttendance: vi.fn(),
  deleteStaffAttendance: vi.fn(),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchTeachers: vi.fn(),
}))

const mockedFetchLog = vi.mocked(fetchStaffAttendance)
const mockedFetchReport = vi.mocked(fetchStaffAttendanceReport)
const mockedCreateManual = vi.mocked(createManualAttendance)
const mockedConfirm = vi.mocked(confirmStaffAttendance)
const mockedDelete = vi.mocked(deleteStaffAttendance)
const mockedFetchTeachers = vi.mocked(fetchTeachers)

function makeAttendance(overrides: Partial<StaffAttendance> = {}): StaffAttendance {
  return {
    id: 1,
    userId: 10,
    centerId: 1,
    workDate: '2026-09-24',
    checkInAt: '2026-09-24T04:10:00.000Z',
    firstLessonAt: null,
    lateMinutes: 0,
    source: AttendanceSource.SELF,
    confidence: AttendanceConfidence.HIGH,
    distanceMeters: null,
    geoMatched: true,
    ipMatched: true,
    flags: [],
    confirmedByUserId: null,
    confirmedAt: null,
    note: null,
    user: { id: 10, firstName: 'Ali', lastName: 'Valiyev' },
    ...overrides,
  }
}

function makeReport(overrides: Partial<StaffAttendanceReport> = {}): StaffAttendanceReport {
  return { from: '2026-09-01', to: '2026-09-24', centerNotConfigured: false, rows: [], ...overrides }
}

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return { id: 10, firstName: 'Ali', lastName: 'Valiyev', role: UserRole.TEACHER, ...overrides }
}

describe('useStaffAttendance', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    const user = useUserStore()
    user.user = {
      id: 1,
      firstName: 'Admin',
      lastName: 'Admin',
      login: 'admin',
      phone: '998',
      role: UserRole.ADMIN,
      permissions: ['*'],
    } as unknown as typeof user.user

    mockedFetchLog.mockResolvedValue({
      data: [makeAttendance()],
      meta: { total: 1, page: 1, perPage: 20, totalPages: 1 },
    })
    mockedFetchReport.mockResolvedValue(makeReport())
    mockedFetchTeachers.mockResolvedValue([makeEmployee()])
    mockedConfirm.mockResolvedValue(undefined)
    mockedDelete.mockResolvedValue(undefined)
    mockedCreateManual.mockResolvedValue(makeAttendance())
  })

  it('filters default to the first-of-month, today, page 1, and the boolean flags cleared', () => {
    const s = useStaffAttendance()
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')

    expect(s.filters.from).toBe(`${y}-${m}-01`)
    expect(s.filters.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(s.filters.page).toBe(1)
    expect(s.filters.onlyLate).toBe(false)
    expect(s.filters.onlyFlagged).toBe(false)
  })

  describe('init()', () => {
    it('loads the log, the report with the default from/to, and the employee options', async () => {
      const s = useStaffAttendance()

      await s.init()

      expect(mockedFetchLog).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, perPage: 20, userId: undefined }),
      )
      expect(mockedFetchReport).toHaveBeenCalledWith(s.filters.from, s.filters.to)
      expect(mockedFetchTeachers).toHaveBeenCalledTimes(1)
      expect(s.employees.value).toEqual([{ label: 'Ali Valiyev', value: 10 }])
      expect(s.rows.value).toEqual([makeAttendance()])
      expect(s.totalPages.value).toBe(1)
    })
  })

  describe('loadLog params', () => {
    it('sends falsy filters as undefined', async () => {
      const s = useStaffAttendance()
      await s.init()
      mockedFetchLog.mockClear()

      s.filters.userId = null
      s.filters.from = ''
      s.filters.to = ''
      s.filters.onlyLate = false
      s.filters.onlyFlagged = false
      s.reloadLog()
      await flush()

      expect(mockedFetchLog).toHaveBeenCalledWith({
        page: 1,
        perPage: 20,
        userId: undefined,
        from: undefined,
        to: undefined,
        onlyLate: undefined,
        onlyFlagged: undefined,
      })
    })

    it('sends the set filters through', async () => {
      const s = useStaffAttendance()
      await s.init()
      mockedFetchLog.mockClear()

      s.filters.userId = 10
      s.filters.onlyLate = true
      s.filters.onlyFlagged = true
      s.reloadLog()
      await flush()

      expect(mockedFetchLog).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 10, onlyLate: true, onlyFlagged: true }),
      )
    })
  })

  describe('reload / reloadLog / setPage', () => {
    it('reloadLog resets the page and reloads only the log', async () => {
      const s = useStaffAttendance()
      await s.init()
      s.filters.page = 3
      mockedFetchLog.mockClear()
      mockedFetchReport.mockClear()

      s.reloadLog()
      await flush()

      expect(s.filters.page).toBe(1)
      expect(mockedFetchLog).toHaveBeenCalledTimes(1)
      expect(mockedFetchReport).not.toHaveBeenCalled()
    })

    it('reload resets the page and reloads both the log and the report', async () => {
      const s = useStaffAttendance()
      await s.init()
      s.filters.page = 3
      mockedFetchLog.mockClear()
      mockedFetchReport.mockClear()

      s.reload()
      await flush()

      expect(s.filters.page).toBe(1)
      expect(mockedFetchLog).toHaveBeenCalledTimes(1)
      expect(mockedFetchReport).toHaveBeenCalledTimes(1)
    })

    it('setPage reloads the log with the new page', async () => {
      const s = useStaffAttendance()
      await s.init()
      mockedFetchLog.mockClear()

      s.setPage(4)
      await flush()

      expect(s.filters.page).toBe(4)
      expect(mockedFetchLog).toHaveBeenCalledWith(expect.objectContaining({ page: 4 }))
    })
  })

  describe('confirm()', () => {
    it('confirms the row, notifies success, and reloads the log', async () => {
      const s = useStaffAttendance()
      await s.init()
      mockedFetchLog.mockClear()
      const row = makeAttendance({ id: 42 })

      await s.confirm(row)

      expect(mockedConfirm).toHaveBeenCalledWith(42)
      expect(mockedFetchLog).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('staffAttendance.messages.confirmed'),
        }),
      )
    })
  })

  describe('askDelete() / confirmDelete()', () => {
    it('sets and clears pendingDelete, notifies, and reloads the log and report', async () => {
      const s = useStaffAttendance()
      await s.init()
      const row = makeAttendance({ id: 7 })

      s.askDelete(row)
      expect(s.pendingDelete.value).toEqual(row)

      mockedFetchLog.mockClear()
      mockedFetchReport.mockClear()
      await s.confirmDelete()

      expect(mockedDelete).toHaveBeenCalledWith(7)
      expect(s.pendingDelete.value).toBeNull()
      expect(mockedFetchLog).toHaveBeenCalledTimes(1)
      expect(mockedFetchReport).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('staffAttendance.messages.deleted'),
        }),
      )
    })

    it('confirmDelete is a no-op with no pending row', async () => {
      const s = useStaffAttendance()
      await s.confirmDelete()
      expect(mockedDelete).not.toHaveBeenCalled()
    })
  })

  describe('openManual() / submitManual()', () => {
    it('openManual resets the manual form', () => {
      const s = useStaffAttendance()
      s.manual.userId = 99
      s.manual.note = 'stale'

      s.openManual()

      expect(s.manual.open).toBe(true)
      expect(s.manual.userId).toBeNull()
      expect(s.manual.checkInTime).toBe('09:00')
      expect(s.manual.note).toBe('')
      expect(s.manual.workDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('submitManual is a no-op when userId is null', async () => {
      const s = useStaffAttendance()
      s.manual.userId = null

      await s.submitManual()

      expect(mockedCreateManual).not.toHaveBeenCalled()
    })

    it('submitManual posts the form (trimming an empty note to undefined), notifies, closes, and reloads', async () => {
      const s = useStaffAttendance()
      await s.init()
      s.manual.open = true
      s.manual.userId = 10
      s.manual.workDate = '2026-09-20'
      s.manual.checkInTime = '08:30'
      s.manual.note = '   '
      mockedFetchLog.mockClear()
      mockedFetchReport.mockClear()

      await s.submitManual()

      expect(mockedCreateManual).toHaveBeenCalledWith({
        userId: 10,
        workDate: '2026-09-20',
        checkInTime: '08:30',
        note: undefined,
      })
      expect(s.manual.open).toBe(false)
      expect(mockedFetchLog).toHaveBeenCalledTimes(1)
      expect(mockedFetchReport).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('staffAttendance.messages.manualSaved'),
        }),
      )
    })

    it('submitManual keeps a non-empty note', async () => {
      const s = useStaffAttendance()
      s.manual.userId = 10
      s.manual.note = '  kechikdi  '

      await s.submitManual()

      expect(mockedCreateManual).toHaveBeenCalledWith(
        expect.objectContaining({ note: 'kechikdi' }),
      )
    })
  })

  describe('totalPages', () => {
    it('is the ceiling of total/perPage, or 1 with no rows', async () => {
      mockedFetchLog.mockResolvedValueOnce({
        data: [],
        meta: { total: 45, page: 1, perPage: 20, totalPages: 3 },
      })
      const s = useStaffAttendance()
      await s.init()
      expect(s.totalPages.value).toBe(3)

      mockedFetchLog.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, perPage: 20, totalPages: 1 } })
      await s.reloadLog()
      expect(s.totalPages.value).toBe(1)
    })
  })

  describe('centerNotConfigured', () => {
    it('reflects the report flag', async () => {
      mockedFetchReport.mockResolvedValueOnce(makeReport({ centerNotConfigured: true }))
      const s = useStaffAttendance()
      await s.init()
      expect(s.centerNotConfigured.value).toBe(true)
    })

    it('is false with no report loaded yet', () => {
      const s = useStaffAttendance()
      expect(s.centerNotConfigured.value).toBe(false)
    })
  })
})

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}
