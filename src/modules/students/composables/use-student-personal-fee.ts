import { computed, reactive, ref } from 'vue'
import { clearPersonalFee, previewClearPersonalFee } from '../api/students.api'
import { useNotificationStore } from '@/stores/notification.store'
import { formatMonthName } from '@/shared/utils/format-month'
import { formatSom } from '@/shared/utils/format-money'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { OverpaymentMode } from '../enums/overpayment-mode.enum'
import type { PersonalFeeClearResponse, PersonalFeePreview } from '../interfaces/student-personal-fee.interface'
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
 * mistake in ONE group (usually the group's own price, which then never
 * followed a group price change). The admin picks the month (default: the
 * month the student was activated); from it the group price applies and every
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
    month: null as string | null,
    overpayment: OverpaymentMode.REFUND,
  })
  const preview = ref<PersonalFeePreview | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const monthOptions = computed(() => (preview.value ? monthsSince(preview.value.minMonth) : []))
  const canSubmit = computed(
    () => !!preview.value && preview.value.fromMonth === state.month && !loading.value && !saving.value,
  )

  async function load(month?: string): Promise<void> {
    if (state.studentId == null || state.groupId == null) return
    loading.value = true
    error.value = ''
    try {
      preview.value = await previewClearPersonalFee(
        state.studentId,
        month ? { groupId: state.groupId, fromMonth: month } : { groupId: state.groupId },
      )
      state.month = preview.value.fromMonth
    } catch (e) {
      error.value = mapBackendErrors(e).fromMonth ?? ''
    } finally {
      loading.value = false
    }
  }

  async function open(studentId: number, groupId: number): Promise<void> {
    Object.assign(state, { open: true, studentId, groupId, month: null, overpayment: OverpaymentMode.REFUND })
    preview.value = null
    await load()
  }

  function pickMonth(month: string | null): void {
    if (!month || month === state.month) return
    state.month = month
    void load(month)
  }

  async function submit(): Promise<void> {
    if (!canSubmit.value || state.studentId == null || state.groupId == null || !state.month) return
    saving.value = true
    try {
      const res = await clearPersonalFee(state.studentId, {
        groupId: state.groupId,
        fromMonth: state.month,
        overpayment: state.overpayment,
      })
      notify.success(doneMessage(res))
      state.open = false
      await onDone()
    } catch (e) {
      error.value = mapBackendErrors(e).fromMonth ?? ''
    } finally {
      saving.value = false
    }
  }

  /** Overpayment → the admin chooses: give it back or move it to the next months. */
  const hasOverpayment = computed(() => (preview.value?.totals.refund ?? 0) > 0)

  return { state, preview, loading, saving, error, monthOptions, canSubmit, hasOverpayment, open, pickMonth, submit }
}

function doneMessage(res: PersonalFeeClearResponse): string {
  const month = formatMonthName(res.fromMonth)
  if (res.carriedAmount > 0) {
    return t('students.personalFee.doneCarried', { month, amount: formatSom(res.carriedAmount) })
  }
  if (res.refundedAmount > 0) {
    return t('students.personalFee.doneRefund', { month, amount: formatSom(res.refundedAmount) })
  }
  return t('students.personalFee.done', { month })
}
