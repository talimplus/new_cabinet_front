import { reactive } from 'vue'
import { createStaffAdvance, createStaffBonus } from '@/modules/staff/api/staff-pay-extras.api'
import { useNotificationStore } from '@/stores/notification.store'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import { PayrollExtraKind } from '../enums/payroll-extra-kind.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

export interface PayrollExtraState {
  open: boolean
  kind: PayrollExtraKind
  staff: StaffSalary | null
  amount: number | null
  /** "YYYY-MM". */
  forMonth: string
  /** Comment for an advance, required reason for a bonus. */
  text: string
  saving: boolean
  errors: Record<string, string>
}

/** The fields the dialog edits. */
export interface PayrollExtraPatch {
  amount?: number | null
  forMonth?: string
  text?: string
}

/** "YYYY-MM" of `date` shifted by `offset` months. */
export function monthKey(offset = 0, date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + offset, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Payroll row → "Avans berish" / "Mukofot" dialogs. An advance defaults to the
 * current month (it may go up to next month); a bonus defaults to the row's
 * month and may never be in the future. `onSaved` reloads the payroll list.
 */
export function usePayrollExtras(onSaved: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const form = reactive<PayrollExtraState>({
    open: false, kind: PayrollExtraKind.ADVANCE, staff: null, amount: null,
    forMonth: monthKey(), text: '', saving: false, errors: {},
  })

  function open(kind: PayrollExtraKind, staff: StaffSalary): void {
    const forMonth = kind === PayrollExtraKind.BONUS ? staff.forMonth.slice(0, 7) : monthKey()
    Object.assign(form, { open: true, kind, staff, amount: null, forMonth, text: '', errors: {} })
  }

  function setField(patch: PayrollExtraPatch): void {
    Object.assign(form, patch)
  }

  function close(): void {
    if (!form.saving) form.open = false
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    const isBonus = form.kind === PayrollExtraKind.BONUS
    if (!form.amount || form.amount <= 0) errors.amount = t('payroll.extras.validation.amount')
    if (!/^\d{4}-\d{2}$/.test(form.forMonth)) errors.forMonth = t('payroll.extras.validation.month')
    else if (isBonus && form.forMonth > monthKey()) errors.forMonth = t('payroll.extras.validation.bonusMonth')
    else if (!isBonus && form.forMonth > monthKey(1)) errors.forMonth = t('payroll.extras.validation.advanceMonth')
    if (isBonus && !form.text.trim()) errors.reason = t('payroll.extras.validation.reason')
    form.errors = errors
    return Object.keys(errors).length === 0
  }

  async function submit(): Promise<void> {
    if (!form.staff || !validate()) return
    const amount = form.amount ?? 0
    const base = { userId: form.staff.userId, amount, forMonth: form.forMonth }
    form.saving = true
    try {
      if (form.kind === PayrollExtraKind.BONUS) {
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

  return { form, open, setField, close, submit }
}
