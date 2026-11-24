import { computed, reactive, ref } from 'vue'
import { clearPersonalFee, previewClearPersonalFee } from '../api/students.api'
import { useNotificationStore } from '@/stores/notification.store'
import { formatDate, parseDate, toDateString } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { OverpaymentMode } from '../enums/overpayment-mode.enum'
import type { PersonalFeeClearResponse, PersonalFeePreview } from '../interfaces/student-personal-fee.interface'
import { t } from '@/locales'

/**
 * "Switch to the group price" — undo a personal price reception typed by
 * mistake in ONE group (usually the group's own price, which then never
 * followed a group price change). The admin picks the exact day (default:
 * the day the student was activated, mid-month allowed); lessons from it use
 * the group price and every
 * row of that group, paid ones too, is rebilled: a dearer group price leaves a
 * debt, a cheaper one an overpayment the admin gives back or moves to the next
 * months. The preview shows the impact before the confirm is enabled.
 */
export function useStudentPersonalFee(onDone: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const state = reactive({
    open: false,
    studentId: null as number | null,
    groupId: null as number | null,
    date: null as string | null,
    overpayment: OverpaymentMode.REFUND,
  })
  const preview = ref<PersonalFeePreview | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const minDate = computed(() => parseDate(preview.value?.minDate) ?? undefined)
  const dateModel = computed(() => parseDate(state.date))
  const canSubmit = computed(
    () => !!preview.value && preview.value.fromDate === state.date && !loading.value && !saving.value,
  )

  async function load(date?: string): Promise<void> {
    if (state.studentId == null || state.groupId == null) return
    loading.value = true
    error.value = ''
    try {
      preview.value = await previewClearPersonalFee(
        state.studentId,
        date ? { groupId: state.groupId, fromDate: date } : { groupId: state.groupId },
      )
      state.date = preview.value.fromDate
    } catch (e) {
      error.value = mapBackendErrors(e).fromDate ?? ''
    } finally {
      loading.value = false
    }
  }

  async function open(studentId: number, groupId: number): Promise<void> {
    Object.assign(state, { open: true, studentId, groupId, date: null, overpayment: OverpaymentMode.REFUND })
    preview.value = null
    await load()
  }

  function pickDate(value: Date | null): void {
    const date = toDateString(value)
    if (!date || date === state.date) return
    state.date = date
    void load(date)
  }

  async function submit(): Promise<void> {
    if (!canSubmit.value || state.studentId == null || state.groupId == null || !state.date) return
    saving.value = true
    try {
      const res = await clearPersonalFee(state.studentId, {
        groupId: state.groupId,
        fromDate: state.date,
        overpayment: state.overpayment,
      })
      notify.success(doneMessage(res))
      state.open = false
      await onDone()
    } catch (e) {
      error.value = mapBackendErrors(e).fromDate ?? ''
    } finally {
      saving.value = false
    }
  }

  /** Overpayment → the admin chooses: give it back or move it to the next months. */
  const hasOverpayment = computed(() => (preview.value?.totals.refund ?? 0) > 0)

  return { state, preview, loading, saving, error, minDate, dateModel, canSubmit, hasOverpayment, open, pickDate, submit }
}

function doneMessage(res: PersonalFeeClearResponse): string {
  const date = formatDate(res.fromDate)
  if (res.carriedAmount > 0) {
    return t('students.personalFee.doneCarried', { date, amount: formatSom(res.carriedAmount) })
  }
  if (res.refundedAmount > 0) {
    return t('students.personalFee.doneRefund', { date, amount: formatSom(res.refundedAmount) })
  }
  return t('students.personalFee.done', { date })
}
