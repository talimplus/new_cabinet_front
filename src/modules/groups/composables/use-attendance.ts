import { ref, reactive, computed, type Ref } from 'vue'
import { fetchLessonDates, submitAttendance, rescheduleAttendance } from '../api/attendance.api'
import { useNotificationStore } from '@/stores/notification.store'
import { usePermissions } from '@/shared/composables/use-permissions'
import { toDateString, formatDate } from '@/shared/utils/format-date'
import { AttendanceStatus } from '../enums/attendance-status.enum'
import type { Student } from '@/modules/students/interfaces/student.interface'
import type {
  LessonDatesResponse,
  LessonDatesParams,
  AttendanceItem,
  GroupStudentMembership,
  RescheduleAttendancePayload,
} from '../interfaces/attendance.interface'
import { t } from '@/locales'

/**
 * Attendance matrix state + actions for one group. Owns lesson-date loading, the
 * per-date editability rules, the cell status picker, and the reschedule dialog.
 * The `students` ref (shared with the page) provides the matrix rows.
 */
export function useAttendance(groupId: number, students: Ref<Student[]>) {
  const notify = useNotificationStore()
  const { canManageAttendance, canManagePastAttendance } = usePermissions()

  const now = new Date()
  const data = ref<LessonDatesResponse | null>(null)
  const loading = ref(false)
  // The matrix is browsed one month at a time (1-based month, matches the old app).
  const year = ref(now.getFullYear())
  const month = ref(now.getMonth() + 1)

  const lessonDates = computed(() => data.value?.lessonDates ?? [])
  const today = computed(() => data.value?.today ?? '')
  const overrides = computed(() => data.value?.overridesByDate ?? {})
  const membership = computed<GroupStudentMembership[]>(() => data.value?.students ?? [])

  /** Inclusive first…last calendar day of the selected month as `YYYY-MM-DD`. */
  function monthRange(): { from: string; to: string } {
    const mm = String(month.value).padStart(2, '0')
    const lastDay = new Date(year.value, month.value, 0).getDate()
    return { from: `${year.value}-${mm}-01`, to: `${year.value}-${mm}-${String(lastDay).padStart(2, '0')}` }
  }

  function buildParams(): LessonDatesParams {
    return { mode: 'range', ...monthRange() }
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      data.value = await fetchLessonDates(groupId, buildParams())
    } finally {
      loading.value = false
    }
  }

  function setMonth(value: number): void {
    month.value = value
    load()
  }
  function setYear(value: number): void {
    year.value = value
    load()
  }
  function goToCurrentMonth(): void {
    const d = new Date()
    year.value = d.getFullYear()
    month.value = d.getMonth() + 1
    load()
  }

  // --- date-state helpers -------------------------------------------------
  const isToday = (date: string): boolean => date === today.value
  const isPast = (date: string): boolean => !!today.value && date < today.value
  const isFuture = (date: string): boolean => !!today.value && date > today.value
  const overrideType = (date: string): 'cancelled' | 'extra' | undefined => overrides.value[date]?.type
  const isCancelled = (date: string): boolean => overrideType(date) === 'cancelled'

  // --- membership window (joinedAt inclusive … leftAt exclusive) ----------
  const joinedAtOf = (studentId: number): string | null =>
    membership.value.find((s) => s.id === studentId)?.joinedAt ?? null
  const leftAtOf = (studentId: number): string | null =>
    membership.value.find((s) => s.id === studentId)?.leftAt ?? null

  function isOutsideEnrollment(studentId: number, date: string): boolean {
    const joined = joinedAtOf(studentId)
    if (joined && date < joined) return true
    const left = leftAtOf(studentId)
    return !!left && date >= left
  }
  /** Hover text explaining why a cell is locked; '' when the cell is in-window. */
  function enrollmentReason(studentId: number, date: string): string {
    const joined = joinedAtOf(studentId)
    if (joined && date < joined) return t('groups.attendance.beforeJoin', { date: formatDate(joined) })
    const left = leftAtOf(studentId)
    if (left && date >= left) return t('groups.attendance.afterLeave', { date: formatDate(left) })
    return ''
  }

  function rowsFor(date: string): AttendanceItem[] {
    const entry = data.value?.attendanceByDate[date]
    if (!entry?.exists) return []
    return entry.rows ?? entry.items ?? []
  }
  function cellFor(studentId: number, date: string): AttendanceItem | undefined {
    return rowsFor(date).find((r) => r.studentId === studentId)
  }
  const statusOf = (studentId: number, date: string): AttendanceStatus | null =>
    cellFor(studentId, date)?.status ?? null
  const commentOf = (studentId: number, date: string): string =>
    cellFor(studentId, date)?.comment?.trim() ?? ''

  /**
   * today → needs canManageAttendance; past → canManagePastAttendance;
   * future / cancelled → never editable.
   */
  function canEditCell(date: string): boolean {
    if (isCancelled(date) || isFuture(date)) return false
    if (isToday(date)) return canManageAttendance.value
    if (isPast(date)) return canManagePastAttendance.value
    return false
  }

  // --- status picker ------------------------------------------------------
  const picker = reactive({
    open: false,
    studentId: 0,
    date: '',
    status: AttendanceStatus.PRESENT,
    comment: '',
    saving: false,
  })

  function openCell(studentId: number, date: string): void {
    if (!canEditCell(date) || isOutsideEnrollment(studentId, date)) return
    const existing = cellFor(studentId, date)
    picker.studentId = studentId
    picker.date = date
    picker.status = existing?.status ?? AttendanceStatus.PRESENT
    picker.comment = existing?.comment ?? ''
    picker.open = true
  }

  async function saveCell(): Promise<void> {
    // Backend requires a reason for an excused absence — guard before the call.
    if (picker.status === AttendanceStatus.EXCUSED && !picker.comment.trim()) {
      notify.error(t('groups.attendance.commentRequired'))
      return
    }
    const comment = picker.comment.trim()
    const items: AttendanceItem[] = [
      { studentId: picker.studentId, status: picker.status, ...(comment ? { comment } : {}) },
    ]
    picker.saving = true
    try {
      await submitAttendance(groupId, { lessonDate: picker.date, items })
      notify.success(t('common.saved'))
      picker.open = false
      await load()
    } finally {
      picker.saving = false
    }
  }

  // --- reschedule ---------------------------------------------------------
  const reschedule = reactive({
    open: false,
    fromDate: '',
    toDate: null as Date | null,
    reason: '',
    saving: false,
  })

  function canRescheduleDate(date: string): boolean {
    return (
      isToday(date) &&
      lessonDates.value.includes(date) &&
      !isCancelled(date) &&
      rowsFor(date).length === 0
    )
  }
  function openReschedule(date: string): void {
    if (!canRescheduleDate(date)) return
    reschedule.fromDate = date
    reschedule.toDate = null
    reschedule.reason = ''
    reschedule.open = true
  }
  async function submitReschedule(): Promise<void> {
    const to = toDateString(reschedule.toDate)
    if (!to) return
    const payload: RescheduleAttendancePayload = {
      toDate: to,
      fromDate: reschedule.fromDate || undefined,
      reason: reschedule.reason.trim() || undefined,
    }
    reschedule.saving = true
    try {
      await rescheduleAttendance(groupId, payload)
      notify.success(t('groups.reschedule.submit'))
      reschedule.open = false
      await load()
    } finally {
      reschedule.saving = false
    }
  }

  return {
    students,
    data,
    loading,
    year,
    month,
    membership,
    lessonDates,
    today,
    load,
    setMonth,
    setYear,
    goToCurrentMonth,
    isToday,
    isPast,
    isFuture,
    isCancelled,
    overrideType,
    isOutsideEnrollment,
    enrollmentReason,
    statusOf,
    commentOf,
    canEditCell,
    picker,
    openCell,
    saveCell,
    reschedule,
    canRescheduleDate,
    openReschedule,
    submitReschedule,
  }
}
