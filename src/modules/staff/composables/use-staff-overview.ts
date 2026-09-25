import { computed, reactive, ref } from 'vue'
import {
  createStaffDeduction,
  deleteStaffDeduction,
  fetchMyOverview,
  fetchStaffOverview,
} from '../api/staff.api'
import { payStaffSalary } from '@/modules/payroll/api/payroll.api'
import { useNotificationStore } from '@/stores/notification.store'
import { formatSom } from '@/shared/utils/format-money'
import { StaffDeductionType } from '../enums/staff-deduction-type.enum'
import { StaffTab, STAFF_TAB_LABEL_KEYS } from '../enums/staff-tab.enum'
import type { StaffOverview, StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'
import { t } from '@/locales'

interface DeductionFormState {
  open: boolean
  amount: number | null
  reason: string
  type: StaffDeductionType
}

interface PayFormState {
  open: boolean
  amount: number | null
  comment: string
}

const currentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * The employee page: attendance, money they took but haven't settled, fines,
 * and the month's salary. `userId === null` means "my own page"
 * (`/staff/me/overview`), which every employee may open.
 */
export function useStaffOverview(userId: () => number | null, initialMonth?: () => string) {
  const notify = useNotificationStore()

  const data = ref<StaffOverview | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const month = ref(initialMonth?.() || currentMonth())
  const tab = ref<string>(StaffTab.LATE)

  const deduction = reactive<DeductionFormState>({
    open: false,
    amount: null,
    reason: '',
    type: StaffDeductionType.OTHER,
  })
  const pay = reactive<PayFormState>({ open: false, amount: null, comment: '' })

  const salary = computed(() => data.value?.salary ?? null)
  const summary = computed(() => data.value?.summary ?? null)

  const tabs = computed<TabItem[]>(() => [
    { key: StaffTab.LATE, labelKey: STAFF_TAB_LABEL_KEYS[StaffTab.LATE], badge: data.value?.lateRecords.length },
    {
      key: StaffTab.RECEIPTS,
      labelKey: STAFF_TAB_LABEL_KEYS[StaffTab.RECEIPTS],
      badge: summary.value?.unsettledCount,
      badgeAlert: true,
    },
    { key: StaffTab.DEDUCTIONS, labelKey: STAFF_TAB_LABEL_KEYS[StaffTab.DEDUCTIONS], badge: data.value?.deductions.length },
    { key: StaffTab.MONTHS, labelKey: STAFF_TAB_LABEL_KEYS[StaffTab.MONTHS] },
  ])

  async function load(): Promise<void> {
    loading.value = true
    try {
      const id = userId()
      data.value = id ? await fetchStaffOverview(id, month.value) : await fetchMyOverview(month.value)
    } catch {
      // Toasted by the interceptor; the card shows its empty state.
      data.value = null
    } finally {
      loading.value = false
    }
  }

  function setMonth(value: string): void {
    month.value = value
    load()
  }

  function openPay(): void {
    pay.open = true
    pay.amount = salary.value?.remaining ?? null
    pay.comment = ''
  }

  function openDeduction(): void {
    deduction.open = true
    deduction.amount = null
    deduction.reason = ''
    deduction.type = StaffDeductionType.OTHER
  }

  const payError = computed(() => {
    const value = pay.amount
    const remaining = salary.value?.remaining ?? 0
    if (value == null || value <= 0) return t('staff.salary.payPositive')
    if (value > remaining) return t('staff.salary.payTooMuch', { amount: formatSom(remaining) })
    return ''
  })

  const deductionValid = computed(
    () => (deduction.amount ?? 0) > 0 && deduction.reason.trim().length > 0,
  )

  async function submitPay(): Promise<boolean> {
    if (!salary.value || payError.value) return false
    submitting.value = true
    try {
      await payStaffSalary(salary.value.id, {
        amount: pay.amount ?? 0,
        comment: pay.comment.trim() || undefined,
      })
      notify.success(t('staff.salary.paySuccess'))
      pay.open = false
      await load()
      return true
    } catch {
      return false
    } finally {
      submitting.value = false
    }
  }

  async function submitDeduction(): Promise<boolean> {
    const id = userId() ?? data.value?.user.id
    if (!id || !deductionValid.value) return false
    submitting.value = true
    try {
      await createStaffDeduction({
        userId: id,
        amount: deduction.amount ?? 0,
        reason: deduction.reason.trim(),
        type: deduction.type,
        forMonth: month.value,
      })
      notify.success(t('staff.deduction.success'))
      deduction.open = false
      await load()
      return true
    } catch {
      return false
    } finally {
      submitting.value = false
    }
  }

  async function removeDeduction(row: StaffDeductionRow): Promise<boolean> {
    submitting.value = true
    try {
      await deleteStaffDeduction(row.id)
      notify.success(t('staff.deduction.deleted'))
      await load()
      return true
    } catch {
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    data, loading, submitting, month, tab, tabs, salary, summary,
    deduction, pay, payError, deductionValid,
    load, setMonth, openPay, openDeduction, submitPay, submitDeduction, removeDeduction,
  }
}
