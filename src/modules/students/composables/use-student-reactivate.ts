import { computed, reactive, ref } from 'vue'
import { changeStudentStatus, fetchStudentReactivation } from '../api/students.api'
import { StudentStatus } from '../enums/student-status.enum'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import { optionalRequest } from '@/shared/permissions/optional-request'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { parseDate, toDateString } from '@/shared/utils/format-date'
import { useNotificationStore } from '@/stores/notification.store'
import type { StudentReactivation } from '../interfaces/student-start.interface'
import { t } from '@/locales'

/**
 * "Return to active" for a stopped / finished student — mostly to undo a
 * status set by mistake. The date defaults to the day the status changed:
 * picking it leaves no gap (as if the status never changed); a later day
 * leaves the days in between unbilled. Earlier than that or after today the
 * backend refuses (422 `returnDate`), so the picker is bounded the same way.
 */
export function useStudentReactivate(onDone: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const state = reactive({
    open: false, studentId: null as number | null, name: '', date: null as Date | null, groupId: null as number | null,
  })
  const info = ref<StudentReactivation | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const groupError = ref('')
  /** Running groups of the student's center they are not in yet — "also add to a group". */
  const groupOptions = ref<SelectOption[]>([])

  const minDate = computed(() => parseDate(info.value?.statusChangedOn) ?? undefined)
  const maxDate = computed(() => parseDate(info.value?.today) ?? new Date())
  /** Groups the student goes on in; none → nothing to return to (move to a group instead). */
  const continuing = computed(() => (info.value?.groups ?? []).filter((g) => !g.finished))
  /** No group to go on in (left their only one) — picking a new group is required. */
  const needsGroup = computed(() => !continuing.value.length)
  const canSubmit = computed(
    () => !!info.value && !!state.date && (!needsGroup.value || state.groupId != null) && !saving.value,
  )

  async function open(studentId: number, name: string, centerId?: number): Promise<void> {
    Object.assign(state, { open: true, studentId, name, date: null, groupId: null })
    info.value = null
    error.value = ''
    groupError.value = ''
    loading.value = true
    try {
      const [data, groups] = await Promise.all([
        fetchStudentReactivation(studentId),
        optionalRequest(fetchAllGroups(centerId), []),
      ])
      info.value = data
      const mine = new Set(data.groups.map((g) => g.id))
      groupOptions.value = groups
        .filter((g) => g.status !== GroupStatus.FINISHED && !mine.has(g.id))
        .map((g) => ({ label: g.name, value: g.id }))
      state.date = parseDate(data.statusChangedOn) ?? parseDate(data.today)
    } catch {
      state.open = false // toasted by the interceptor
    } finally {
      loading.value = false
    }
  }

  async function submit(): Promise<void> {
    if (!canSubmit.value || state.studentId == null) return
    saving.value = true
    error.value = ''
    try {
      await changeStudentStatus(state.studentId, StudentStatus.ACTIVE, {
        returnDate: toDateString(state.date),
        groupId: state.groupId ?? undefined,
      })
      notify.success(t('students.reactivate.done', { name: state.name }))
      state.open = false
      await onDone()
    } catch (e) {
      const mapped = mapBackendErrors(e)
      error.value = mapped.returnDate ?? ''
      groupError.value = mapped.groupId ?? ''
    } finally {
      saving.value = false
    }
  }

  return {
    state, info, loading, saving, error, groupError, groupOptions, minDate, maxDate, continuing, needsGroup, canSubmit,
    open, submit,
  }
}
