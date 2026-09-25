import { computed, reactive, ref } from 'vue'
import { fetchStaffSalaries, payStaffSalary } from '../api/payroll.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { getTotalSalary, getRemaining, hasTeachers } from '../utils/payroll-salary'
import { earliestOpening, buildYearOptions, buildMonthOptions } from '../config/payroll-months'
import { formatSom } from '@/shared/utils/format-money'
import { StaffDeductionType } from '@/modules/staff/enums/staff-deduction-type.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'
import type { StaffSalariesParams } from '../interfaces/staff-salaries-params.interface'
import type { PayStaffSalaryForm } from '../interfaces/pay-staff-salary-form.interface'
import { t } from '@/locales'

interface PayrollFilters {
  year: number
  /** "MM". */
  month: string
}

interface PayModalState {
  open: boolean
  staff: StaffSalary | null
  amount: number | null
  comment: string
  loading: boolean
  withDeduction: boolean
  deductionAmount: number | null
  deductionReason: string
  deductionType: StaffDeductionType
}

interface StaffModalState {
  open: boolean
  userId: number | null
}

/** List/state logic for the payroll (staff salaries) page. */
export function usePayroll() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const now = new Date()
  const rows = ref<StaffSalary[]>([])
  const loading = ref(false)
  const filters = reactive<PayrollFilters>({
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
  })

  const pay = reactive<PayModalState>({
    open: false,
    staff: null,
    amount: null,
    comment: '',
    loading: false,
    withDeduction: false,
    deductionAmount: null,
    deductionReason: '',
    deductionType: StaffDeductionType.OTHER,
  })
  const staffModal = reactive<StaffModalState>({ open: false, userId: null })

  const forMonth = computed(() => `${filters.year}-${filters.month}`)
  const showCommission = computed(() => hasTeachers(rows.value))

  // Payroll cannot predate the center; the pickers are clamped to its opening.
  const opened = computed(() => earliestOpening(scope.centers, scope.activeCenterId))
  const yearOptions = computed(() => buildYearOptions(opened.value))
  const monthOptions = computed(() => buildMonthOptions(filters.year, opened.value))

  /** A valid fine needs both an amount and a reason — it is what an auditor reads. */
  const deductionReady = computed(
    () => (pay.deductionAmount ?? 0) > 0 && pay.deductionReason.trim().length > 0,
  )

  async function load(): Promise<void> {
    loading.value = true
    try {
      const params: StaffSalariesParams = { forMonth: forMonth.value }
      rows.value = await fetchStaffSalaries(params)
    } finally {
      loading.value = false
    }
  }

  async function init(): Promise<void> {
    await scope.loadCenters()
    clampMonth()
    await load()
  }

  /** Keeps the selected month inside the year's allowed window. */
  function clampMonth(): void {
    const allowed = monthOptions.value
    if (!allowed.length) return
    if (!allowed.some((m) => m.value === filters.month)) {
      filters.month = allowed[allowed.length - 1]!.value
    }
  }

  function setYear(year: number): void {
    filters.year = year
    clampMonth()
    load()
  }

  function setMonth(month: string): void {
    filters.month = month
    load()
  }

  function openPay(staff: StaffSalary): void {
    Object.assign(pay, {
      open: true,
      staff,
      amount: getRemaining(staff),
      comment: '',
      withDeduction: false,
      deductionAmount: null,
      deductionReason: '',
      deductionType: StaffDeductionType.OTHER,
    })
  }

  function openStaff(staff: StaffSalary): void {
    staffModal.userId = staff.userId
    staffModal.open = true
  }

  async function confirmPay(): Promise<void> {
    if (!pay.staff) return
    const amount = pay.amount ?? 0
    const withFine = pay.withDeduction && deductionReady.value
    // Writing only a fine is allowed — then no money moves at all.
    if (amount <= 0 && !withFine) return

    pay.loading = true
    try {
      const body: PayStaffSalaryForm = { amount }
      const comment = pay.comment.trim()
      if (comment) body.comment = comment
      if (withFine) {
        body.deduction = {
          amount: pay.deductionAmount ?? 0,
          reason: pay.deductionReason.trim(),
          type: pay.deductionType,
        }
      }
      await payStaffSalary(pay.staff.id, body)
      notify.success(
        amount > 0
          ? t('payroll.messages.paymentSuccess', { amount: formatSom(amount) })
          : t('staff.deduction.success'),
      )
      pay.open = false
      await load()
    } finally {
      pay.loading = false
    }
  }

  return {
    scope, rows, loading, filters, forMonth, showCommission, pay, staffModal,
    yearOptions, monthOptions, deductionReady,
    init, load, setYear, setMonth, openPay, openStaff, confirmPay,
    getTotalSalary, getRemaining,
  }
}
