import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStudentAttendance, ATTENDANCE_PAGE } from '../use-student-attendance'
import { fetchStudentAttendance } from '../../api/student-attendance.api'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'

vi.mock('../../api/student-attendance.api', () => ({ fetchStudentAttendance: vi.fn() }))
const mockedFetch = vi.mocked(fetchStudentAttendance)

const item = (id: number, groupId: number) => ({
  id, lessonDate: '2026-10-01', groupId, groupName: `G${groupId}`,
  status: AttendanceStatus.PRESENT, comment: null, submittedBy: null,
})

describe('useStudentAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue({
      groups: [],
      items: [...Array.from({ length: 35 }, (_, i) => item(i + 1, 1)), item(100, 2)],
    })
  })

  it('loads for the student and pages the marks', async () => {
    const a = useStudentAttendance(() => 9)
    await a.load()
    expect(mockedFetch).toHaveBeenCalledWith(9)
    expect(a.visible.value).toHaveLength(ATTENDANCE_PAGE)
    expect(a.remaining.value).toBe(36 - ATTENDANCE_PAGE)
    a.showMore()
    expect(a.remaining.value).toBe(0)
  })

  it('a group chip narrows the list; clicking it again clears the filter', async () => {
    const a = useStudentAttendance(() => 9)
    await a.load()
    a.selectGroup(2)
    expect(a.visible.value.map((i) => i.id)).toEqual([100])
    a.selectGroup(2)
    expect(a.groupId.value).toBeNull()
  })

  it('flags a failed load and skips without a student', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('x'))
    const a = useStudentAttendance(() => 9)
    await a.load()
    expect(a.failed.value).toBe(true)
    const none = useStudentAttendance(() => null)
    await none.load()
    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })
})
