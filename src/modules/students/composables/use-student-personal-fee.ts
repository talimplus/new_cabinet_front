import { computed, reactive, ref } from 'vue'
import { clearPersonalFee, previewClearPersonalFee } from '../api/students.api'
import { useNotificationStore } from '@/stores/notification.store'
import { formatMonthName } from '@/shared/utils/format-month'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { PersonalFeePreview } from '../interfaces/student-personal-fee.interface'
import { t } from '@/locales'

/** `YYYY-MM-01` months from `from` up to the current month, newest first. */
function monthsSince(from: string): SelectOption[] {
  const now = new Date()
  const last = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const out: SelectOption[] = []
  let [y, m] = from.split('-').map(Number) as [number, number]
  for (let key = from; key <= last; ) {
    out.unshift({ label: formatMonthName(key), value: key })
    m += 1
    if (m > 12) { m = 1; y += 1 }
    key = `${y}-${String(m).padStart(2, '0')}-01`
  }
  return out
}

/**
 * "Switch to the group price" — undo a personal price reception typed by
 * mistake (usually the group's own price, which then never followed a group
 * price change). The admin picks the month (default: the month the student was
 * activated); from it the group price applies and every row, paid ones too, is
 * rebilled. The preview shows the impact before the confirm is enabled.
 */
export function useStudentPersonalFee(onDone: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const state = reactive({ open: false, studentId: null as number | null, month: null as string | null })
  const preview = ref<PersonalFeePreview | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const monthOptions = computed(() => (preview.value ? monthsSince(preview.value.minMonth) : []))
  const canSubmit = computed(
    () => !!preview.value && preview.value.fromMonth === state.month && !loading.value && !saving.value,
  )

  async function load(month?: string): Promise<void> {
    if (state.studentId == null) return
    loading.value = true
    error.value = ''
    try {
      preview.value = await previewClearPersonalFee(state.studentId, month ? { fromMonth: month } : {})
      state.month = preview.value.fromMonth
    } catch (e) {
      error.value = mapBackendErrors(e).fromMonth ?? ''
    } finally {
      loading.value = false
    }
  }

  async function open(studentId: number): Promise<void> {
    Object.assign(state, { open: true, studentId, month: null })
    preview.value = null
    await load()
  }

  function pickMonth(month: string | null): void {
    if (!month || month === state.month) return
    state.month = month
    void load(month)
  }

  async function submit(): Promise<void> {
    if (!canSubmit.value || state.studentId == null || !state.month) return
    saving.value = true
    try {
      await clearPersonalFee(state.studentId, { fromMonth: state.month })
      notify.success(t('students.personalFee.done', { month: formatMonthName(state.month) }))
      state.open = false
      await onDone()
    } catch (e) {
      error.value = mapBackendErrors(e).fromMonth ?? ''
    } finally {
      saving.value = false
    }
  }

  return { state, preview, loading, saving, error, monthOptions, canSubmit, open, pickMonth, submit }
}
