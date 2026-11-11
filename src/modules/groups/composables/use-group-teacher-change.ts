import { computed, reactive, ref, watch } from 'vue'
import { changeGroupTeacher } from '../api/groups.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { useScheduleConflicts } from './use-schedule-conflicts'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString } from '@/shared/utils/format-date'
import { useNotificationStore } from '@/stores/notification.store'
import type { Group } from '../interfaces/group.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

const DEFAULT_LESSON_DURATION = 90

/**
 * "Change the teacher" on the group page — the teacher left, or another one
 * takes the group over. Lessons before the chosen day (and the commission on
 * them) stay with the old teacher; the backend splits the month by lessons.
 * The new teacher's week is checked live against the group's schedule; a
 * clash only warns, like the group form.
 */
export function useGroupTeacherChange(onDone: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const state = reactive({
    open: false,
    group: null as Group | null,
    teacherId: null as number | null,
    date: null as Date | null,
  })
  const teachers = ref<SelectOption[]>([])
  const errors = reactive<Record<string, string>>({})
  const saving = ref(false)
  const accepted = ref(false)

  const currentTeacherId = computed(() => state.group?.teacher?.id ?? null)
  const changed = computed(() => state.teacherId != null && state.teacherId !== currentTeacherId.value)

  const conflictCheck = useScheduleConflicts({
    isOpen: () => state.open && changed.value,
    slots: () => (state.group?.schedules ?? []).map((s) => ({ day: s.day, startTime: s.startTime })),
    roomId: () => null,
    teacherId: () => (changed.value ? state.teacherId : null),
    duration: () => state.group?.lessonDurationMinutes ?? DEFAULT_LESSON_DURATION,
    excludeGroupId: () => state.group?.id ?? null,
  })
  // Consent was given for the clashes shown, not for a new teacher's.
  watch(conflictCheck.conflicts, () => { accepted.value = false })

  const canSubmit = computed(
    () =>
      changed.value &&
      !!state.date &&
      !saving.value &&
      !(conflictCheck.conflicts.value.length && !accepted.value),
  )

  async function open(group: Group): Promise<void> {
    Object.keys(errors).forEach((k) => delete errors[k])
    Object.assign(state, { open: true, group, teacherId: null, date: new Date() })
    accepted.value = false
    const list = await optionalRequest(fetchTeachers({ centerId: group.center?.id }), [])
    teachers.value = list
      .filter((x) => x.id !== group.teacher?.id)
      .map((x) => ({ label: `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim() || `#${x.id}`, value: x.id }))
  }

  async function submit(): Promise<void> {
    if (!canSubmit.value || !state.group || state.teacherId == null) return
    Object.keys(errors).forEach((k) => delete errors[k])
    saving.value = true
    try {
      await changeGroupTeacher(state.group.id, {
        teacherId: state.teacherId,
        teacherEffectiveFrom: toDateString(state.date) || toDateString(new Date()),
        allowScheduleConflicts: accepted.value && conflictCheck.conflicts.value.length ? true : undefined,
      })
      notify.success(t('groups.teacherChange.done'))
      state.open = false
      await onDone()
    } catch (error) {
      Object.assign(errors, mapBackendErrors(error))
    } finally {
      saving.value = false
    }
  }

  return { state, teachers, errors, saving, accepted, canSubmit, conflictCheck, open, submit }
}
