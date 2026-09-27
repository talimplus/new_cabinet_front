import { computed, reactive, ref, watch } from 'vue'
import { useGroupOptions } from './use-group-options'
import { useScheduleConflicts } from './use-schedule-conflicts'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '../enums/week-day.enum'
import { FeeApplyFrom } from '../enums/fee-apply-from.enum'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString, formatDate, parseDate } from '@/shared/utils/format-date'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm, GroupFormDay } from '../interfaces/group-form.interface'
import { t } from '@/locales'

const DEFAULT_LESSON_DURATION = 90

interface GroupFormState {
  name: string | number
  centerId: number | null
  subjectId: number | null
  roomId: number | null
  teacherId: number | null
  monthlyFee: string | number
  lessonDurationMinutes: string | number
  endDate: Date | null
  applyFeeNow: boolean
  /** Edit-only: the day the new schedule takes effect (earlier lessons keep the old one). */
  scheduleEffectiveFrom: Date | null
  /** Edit-only: the day the new teacher takes over (commission splits on it). */
  teacherEffectiveFrom: Date | null
}

/** Order-independent key of a schedule: `day@HH:mm`, sorted. */
function scheduleKey(days: GroupFormDay[]): string {
  return days
    .map((d) => `${d.day}@${String(d.startTime ?? '').slice(0, 5)}`)
    .sort()
    .join(',')
}

/**
 * Group create/edit state. The schedule editor (days + times) is kept as local
 * refs and collapsed into the `days` array on submit — read back as `schedules`
 * on edit (matches the old cabinet_front behavior).
 */
export function useGroupForm(
  defaultCenterId: () => number | null,
  /** Whether the form is on screen — the live conflict check only runs then
   *  (defaults to never, so a caller must opt in). */
  isOpen: () => boolean = () => false,
) {
  const { subjects, rooms, teachers, loadFor, clear } = useGroupOptions()

  const form = reactive<GroupFormState>({
    name: '', centerId: null, subjectId: null, roomId: null, teacherId: null,
    monthlyFee: '', lessonDurationMinutes: DEFAULT_LESSON_DURATION, endDate: null, applyFeeNow: false,
    scheduleEffectiveFrom: null, teacherEffectiveFrom: null,
  })
  const errors = reactive<Record<string, string>>({})

  const isEditing = ref(false)
  const editingId = ref<number | null>(null)
  /** The group's current (this-month) price — the baseline for "fee changed". */
  const currentFee = ref<number | null>(null)
  /** The previous end date (YYYY-MM-DD) — to detect a shortening on submit. */
  const previousEndDate = ref<string | null>(null)
  /** Baselines to detect a real schedule / teacher change on edit. */
  const originalScheduleKey = ref('')
  const originalTeacherId = ref<number | null>(null)

  /** Edit-only: the entered price differs from the group's current price. */
  const feeChanged = computed(
    () => isEditing.value && form.monthlyFee !== '' && Number(form.monthlyFee) !== currentFee.value,
  )
  /** New end date is earlier than the old one → confirm before dropping lessons. */
  const isShortening = computed(() => {
    if (!isEditing.value || !form.endDate || !previousEndDate.value) return false
    return toDateString(form.endDate)! < previousEndDate.value.slice(0, 10)
  })
  /** First day of next month, formatted — when the new price takes effect. */
  const nextMonthLabel = computed(() => {
    const now = new Date()
    return formatDate(toDateString(new Date(now.getFullYear(), now.getMonth() + 1, 1)))
  })

  const days = ref<WeekDay[]>([])
  const allTime = ref('')
  const times = ref<string[]>([])
  const differentTime = ref(false)

  const dayOptions = computed(() =>
    Object.values(WeekDay).map((d) => ({ label: t(WEEK_DAY_LABEL_KEYS[d]), value: d })),
  )

  // Center drives the scoped selects; changing it (after init) clears them.
  watch(
    () => form.centerId,
    async (id, old) => {
      if (id === old) return
      if (typeof id === 'number') {
        if (old != null) {
          form.subjectId = null
          form.roomId = null
          form.teacherId = null
        }
        await loadFor(id)
      } else {
        clear()
      }
    },
  )

  function clearErrors(): void {
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  function reset(editing: Group | null): void {
    clearErrors()
    isEditing.value = !!editing
    editingId.value = editing?.id ?? null
    if (editing) {
      form.name = editing.name
      form.centerId = editing.center?.id ?? defaultCenterId()
      form.subjectId = editing.subject?.id ?? null
      form.roomId = editing.room?.id ?? null
      form.teacherId = editing.teacher?.id ?? null
      // Pre-fill with the already-queued next-month price when there is one.
      form.monthlyFee = editing.upcomingMonthlyFee ?? editing.monthlyFee ?? ''
      form.lessonDurationMinutes = editing.lessonDurationMinutes ?? DEFAULT_LESSON_DURATION
      form.endDate = parseDate(editing.endDate)
      form.applyFeeNow = false
      currentFee.value = editing.monthlyFee == null ? null : Number(editing.monthlyFee)
      previousEndDate.value = editing.endDate ?? null
      const sch = editing.schedules ?? []
      originalScheduleKey.value = scheduleKey(sch.map((x) => ({ day: x.day, startTime: x.startTime })))
      originalTeacherId.value = editing.teacher?.id ?? null
      form.scheduleEffectiveFrom = new Date()
      form.teacherEffectiveFrom = new Date()
      days.value = sch.map((s) => s.day)
      if (sch.length > 1) {
        differentTime.value = true
        times.value = sch.map((s) => s.startTime)
        allTime.value = ''
      } else {
        differentTime.value = false
        allTime.value = sch[0]?.startTime ?? ''
        times.value = []
      }
    } else {
      form.name = ''
      form.centerId = defaultCenterId()
      form.subjectId = null
      form.roomId = null
      form.teacherId = null
      form.monthlyFee = ''
      form.lessonDurationMinutes = DEFAULT_LESSON_DURATION
      form.endDate = null
      form.applyFeeNow = false
      currentFee.value = null
      previousEndDate.value = null
      originalScheduleKey.value = ''
      originalTeacherId.value = null
      form.scheduleEffectiveFrom = null
      form.teacherEffectiveFrom = null
      days.value = []
      allTime.value = ''
      times.value = []
      differentTime.value = false
    }
  }

  /** Edit-only: the schedule really changed (the form always re-sends it). */
  const scheduleChanged = computed(
    () => isEditing.value && days.value.length > 0 && scheduleKey(buildDays()) !== originalScheduleKey.value,
  )
  /** Edit-only: a different teacher was picked. */
  const teacherChanged = computed(
    () => isEditing.value && form.teacherId !== originalTeacherId.value,
  )

  function buildDays(): GroupFormDay[] {
    return days.value.map((day, i) => ({
      day,
      startTime: differentTime.value ? times.value[i] ?? '' : allTime.value,
    }))
  }

  const lessonDuration = (): number => {
    const n = Number(form.lessonDurationMinutes)
    return n > 0 ? n : DEFAULT_LESSON_DURATION
  }

  const conflictCheck = useScheduleConflicts({
    isOpen,
    slots: buildDays,
    roomId: () => form.roomId,
    teacherId: () => form.teacherId,
    duration: lessonDuration,
    excludeGroupId: () => editingId.value,
  })

  function validate(): boolean {
    clearErrors()
    if (!String(form.name).trim()) errors.name = t('groups.validation.name')
    if (form.centerId == null) errors.centerId = t('groups.validation.center')
    if (form.subjectId == null) errors.subjectId = t('groups.validation.subject')
    if (form.roomId == null) errors.roomId = t('groups.validation.room')
    if (form.teacherId == null) errors.teacherId = t('groups.validation.teacher')
    if (form.monthlyFee === '' || Number.isNaN(Number(form.monthlyFee))) errors.monthlyFee = t('groups.validation.monthlyFee')
    return Object.keys(errors).length === 0
  }

  function toPayload(): GroupForm {
    const payload: GroupForm = {
      name: String(form.name).trim(),
      centerId: form.centerId as number,
      subjectId: form.subjectId as number,
      roomId: form.roomId as number,
      teacherId: form.teacherId as number,
      monthlyFee: form.monthlyFee === '' ? null : Number(form.monthlyFee),
      lessonDurationMinutes: lessonDuration(),
    }
    // toDateString returns '' for an empty date — coerce that to null so a
    // cleared end date actually clears the term instead of sending "".
    const endDate = toDateString(form.endDate) || null
    // On edit, send `null` to clear the term; on create, only send a real date.
    if (isEditing.value) payload.endDate = endDate
    else if (endDate) payload.endDate = endDate
    // The apply-from choice only matters when the price actually changed.
    if (feeChanged.value)
      payload.applyFeeFrom = form.applyFeeNow ? FeeApplyFrom.CURRENT_MONTH : FeeApplyFrom.NEXT_MONTH

    const built = buildDays()
    if (built.length) payload.days = built
    // Dates matter only for a real change; the backend ignores them otherwise.
    // A cleared date means "from today" — the same as the backend default,
    // sent explicitly so the payload matches what the form promised.
    const today = toDateString(new Date())
    if (scheduleChanged.value)
      payload.scheduleEffectiveFrom = toDateString(form.scheduleEffectiveFrom) || today
    if (teacherChanged.value)
      payload.teacherEffectiveFrom = toDateString(form.teacherEffectiveFrom) || today
    return payload
  }

  function setBackendErrors(error: unknown): void {
    Object.assign(errors, mapBackendErrors(error))
  }
  /** Apply an already-mapped field→message record (e.g. a status-change 422). */
  function setFieldErrors(map: Record<string, string>): void {
    Object.assign(errors, map)
  }

  function setSelect(key: 'centerId' | 'subjectId' | 'roomId' | 'teacherId', value: unknown): void {
    form[key] = typeof value === 'number' ? value : null
  }

  return {
    form, errors, days, allTime, times, differentTime, dayOptions,
    subjects, rooms, teachers,
    feeChanged, isShortening, nextMonthLabel, currentFee,
    scheduleChanged, teacherChanged,
    conflicts: conflictCheck.conflicts,
    conflictChecking: conflictCheck.checking,
    conflictChecked: conflictCheck.checked,
    conflictMessages: conflictCheck.messages,
    reset, validate, toPayload, setBackendErrors, setFieldErrors, setSelect,
  }
}
