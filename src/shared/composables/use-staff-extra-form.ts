import { computed, reactive } from 'vue'
import { createStaffAdvance, createStaffBonus } from '@/shared/api/staff-extras.api'
import { useNotificationStore } from '@/stores/notification.store'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { formatSom } from '@/shared/utils/format-money'
import { StaffExtraKind } from '@/shared/enums/staff-extra-kind.enum'
import type { StaffExtraTarget } from '@/shared/interfaces/staff-extras.interface'
import { t } from '@/locales'

export interface StaffExtraFormState {
  open: boolean
  kind: StaffExtraKind
  target: StaffExtraTarget | null
  amount: number | null
  /** "YYYY-MM" work month. */
  forMonth: string
  /** Comment for an advance, required reason for a bonus. */
  text: string
  saving: boolean
  errors: Record<string, string>
}

/** The fields the dialog edits. */
export interface StaffExtraPatch {
  amount?: number | null
  forMonth?: string
  text?: string
}

/** "YYYY-MM" of `date` shifted by `offset` months. */
export function monthKey(offset = 0, date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + offset, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const monthName = (ym: string): string => `${t(`common.months.${ym.slice(5, 7)}`)} ${ym.slice(0, 4)}`

/**
 * "Avans berish" / "Mukofot" — the same dialog from the users list, the staff
 * page and payroll (none of them needs a salary row to exist: an advance is
 * just money handed out now). An advance is withheld from the chosen WORK
 * month's salary — normally paid the month after — and, when it doesn't fit,
 * from the following ones. It defaults to the current month (may go up to next);
 * a bonus defaults to the target's month and never goes into the future.
 */
export function useStaffExtraForm(onSaved: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const form = reactive<StaffExtraFormState>({
    open: false, kind: StaffExtraKind.ADVANCE, target: null, amount: null,
    forMonth: monthKey(), text: '', saving: false, errors: {},
  })

  const isBonus = computed(() => form.kind === StaffExtraKind.BONUS)
  /** "Noyabr 2026 oyligidan — odatda Dekabr 2026 da beriladi." */
  const monthHint = computed(() => {
    if (!/^\d{4}-\d{2}$/.test(form.forMonth)) return ''
    if (isBonus.value) return t('payroll.extras.bonusMonthHint', { month: monthName(form.forMonth) })
    const [y, m] = form.forMonth.split('-').map(Number)
    const pay = monthKey(1, new Date(y!, m! - 1, 1))
    return t('payroll.extras.advanceMonthHint', { month: monthName(form.forMonth), payMonth: monthName(pay) })
  })

  function open(kind: StaffExtraKind, target: StaffExtraTarget): void {
    const forMonth = kind === StaffExtraKind.BONUS ? (target.month?.slice(0, 7) || monthKey()) : monthKey()
    Object.assign(form, { open: true, kind, target, amount: null, forMonth, text: '', errors: {} })
  }

  function setField(patch: StaffExtraPatch): void {
    Object.assign(form, patch)
  }

  function close(): void {
    if (!form.saving) form.open = false
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!form.amount || form.amount <= 0) errors.amount = t('payroll.extras.validation.amount')
    if (!/^\d{4}-\d{2}$/.test(form.forMonth)) errors.forMonth = t('payroll.extras.validation.month')
    else if (isBonus.value && form.forMonth > monthKey()) errors.forMonth = t('payroll.extras.validation.bonusMonth')
    else if (!isBonus.value && form.forMonth > monthKey(1)) errors.forMonth = t('payroll.extras.validation.advanceMonth')
    if (isBonus.value && !form.text.trim()) errors.reason = t('payroll.extras.validation.reason')
    form.errors = errors
    return Object.keys(errors).length === 0
  }

  async function submit(): Promise<void> {
    if (!form.target || !validate()) return
    const amount = form.amount ?? 0
    const base = { userId: form.target.userId, amount, forMonth: form.forMonth }
    form.saving = true
    try {
      if (isBonus.value) {
        await createStaffBonus({ ...base, reason: form.text.trim() })
        notify.success(t('payroll.extras.bonusSuccess', { amount: formatSom(amount) }))
      } else {
        await createStaffAdvance({ ...base, comment: form.text.trim() || undefined })
        notify.success(t('payroll.extras.advanceSuccess', { amount: formatSom(amount) }))
      }
      form.open = false
      await onSaved()
    } catch (e) {
      // Field errors land under the inputs; anything else is toasted by the interceptor.
      const mapped = mapBackendErrors(e)
      if (mapped.comment) mapped.reason = mapped.comment
      form.errors = mapped
    } finally {
      form.saving = false
    }
  }

  return { form, isBonus, monthHint, open, setField, close, submit }
}
