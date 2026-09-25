import { reactive, ref } from 'vue'
import {
  fetchPayments,
  markAsPaid,
  payPartial,
  calculatePayment,
  updatePayment,
  applyExclusion,
} from '../api/payments.api'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { usePaymentChecks } from './use-payment-checks'
import { usePaymentExport } from './use-payment-export'
import { PaymentStatus } from '../enums/payment-status.enum'
import { toDateString } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import type { Payment } from '../interfaces/payment.interface'
import type { PaymentsParams } from '../interfaces/payment-params.interface'
import type { PaymentCalculationResponse } from '../interfaces/payment-calculation.interface'
import type { MarkAsPaidSubmit, PartialSubmit } from '../interfaces/payment-submit.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

interface PaymentFilters {
  year: number
  month: string
  status: PaymentStatus | 'all'
  groupId: number | null
  teacherId: number | null
  search: string
  page: number
  perPage: number
}

interface DialogState {
  open: boolean
  payment: Payment | null
  loading: boolean
}

interface PartialState extends DialogState {
  plannedStudyUntilDate: Date | null
  calculation: PaymentCalculationResponse | null
  calculating: boolean
}

const now = new Date()
const pad = (n: number): string => String(n).padStart(2, '0')

/** List/state logic for the /payments page. */
export function usePayments() {
  const scope = useScopeStore()
  const notify = useNotificationStore()
  const checks = usePaymentChecks()

  const rows = ref<Payment[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const groupOptions = ref<SelectOption[]>([])
  const teacherOptions = ref<SelectOption[]>([])

  const filters = reactive<PaymentFilters>({
    year: now.getFullYear(),
    month: pad(now.getMonth() + 1),
    status: 'all',
    groupId: null,
    teacherId: null,
    search: '',
    page: 1,
    perPage: 10,
  })

  const markDialog = reactive<DialogState>({ open: false, payment: null, loading: false })
  const partial = reactive<PartialState>({
    open: false,
    payment: null,
    loading: false,
    plannedStudyUntilDate: null,
    calculation: null,
    calculating: false,
  })

  /** The filters the list AND both Excel exports share. */
  function filterParams(withMonth = true): PaymentsParams {
    return {
      forMonth: withMonth ? `${filters.year}-${filters.month}` : undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      groupId: filters.groupId ?? undefined,
      teacherId: filters.teacherId ?? undefined,
      search: filters.search || undefined,
    }
  }

  const exporter = usePaymentExport(filterParams)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data, meta } = await fetchPayments({
        ...filterParams(),
        page: filters.page,
        perPage: filters.perPage,
      })
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  /** Groups follow the teacher filter — an unrelated group can't stay selected. */
  async function loadGroups(): Promise<void> {
    const groups = await optionalRequest(
      fetchAllGroups(undefined, filters.teacherId ?? undefined),
      [],
    )
    groupOptions.value = groups.map((g) => ({ label: g.name, value: g.id }))
    if (filters.groupId && !groups.some((g) => g.id === filters.groupId)) {
      filters.groupId = null
    }
  }

  async function loadTeachers(): Promise<void> {
    const teachers = await optionalRequest(fetchTeachers(), [])
    teacherOptions.value = teachers.map((x) => ({
      label: `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim() || `#${x.id}`,
      value: x.id,
    }))
    if (filters.teacherId && !teachers.some((x) => x.id === filters.teacherId)) {
      filters.teacherId = null
    }
  }

  async function init(): Promise<void> {
    await Promise.all([load(), loadGroups(), loadTeachers()])
  }

  function applyFilters(): void {
    filters.page = 1
    load()
  }
  /**
   * Switching to the current year can strip away the selected month (the tab
   * strip stops at today), so fall back to the current month.
   */
  function setYear(year: number): void {
    filters.year = year
    const thisYear = now.getFullYear()
    const latest = pad(now.getMonth() + 1)
    if (year === thisYear && filters.month > latest) filters.month = latest
    applyFilters()
  }
  function setMonth(month: string): void {
    filters.month = month
    applyFilters()
  }
  function setStatus(status: PaymentStatus | 'all'): void {
    filters.status = status
    applyFilters()
  }
  async function setTeacher(teacherId: number | null): Promise<void> {
    filters.teacherId = teacherId
    filters.groupId = null
    await loadGroups()
    applyFilters()
  }
  function search(value: string): void {
    filters.search = value
    applyFilters()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openMarkAsPaid(payment: Payment): void {
    markDialog.payment = payment
    markDialog.open = true
  }
  function closeMarkAsPaid(): void {
    if (markDialog.loading) return
    markDialog.open = false
    markDialog.payment = null
  }

  async function confirmMarkAsPaid(submit: MarkAsPaidSubmit): Promise<void> {
    if (!markDialog.payment) return
    markDialog.loading = true
    try {
      // The write-off is stored first so mark-as-paid reads the reduced total.
      if (submit.exclusion) await applyExclusion(markDialog.payment.id, submit.exclusion)
      const { check } = await markAsPaid(markDialog.payment.id, submit.reception)
      notify.success(t('payments.messages.markSuccess'))
      markDialog.open = false
      markDialog.payment = null
      await load()
      checks.showChecks([check])
    } finally {
      markDialog.loading = false
    }
  }

  function openPartial(payment: Payment): void {
    partial.open = true
    partial.payment = payment
    partial.plannedStudyUntilDate = null
    partial.calculation = null
  }
  function closePartial(): void {
    if (partial.loading) return
    partial.open = false
    partial.payment = null
    partial.calculation = null
    partial.plannedStudyUntilDate = null
  }

  async function runCalculate(date: Date | null): Promise<void> {
    partial.plannedStudyUntilDate = date
    if (!partial.payment || !date) return
    partial.calculating = true
    try {
      partial.calculation = await calculatePayment(partial.payment.id, {
        plannedStudyUntilDate: toDateString(date),
      })
    } finally {
      partial.calculating = false
    }
  }

  /** "Clear date" cancels the recalculation and frees the amount field again. */
  function clearCalculation(): void {
    partial.plannedStudyUntilDate = null
    partial.calculation = null
  }

  async function confirmPartial(submit: PartialSubmit): Promise<void> {
    if (!partial.payment || submit.amount <= 0) return
    partial.loading = true
    try {
      if (partial.plannedStudyUntilDate) {
        await updatePayment(partial.payment.id, {
          plannedStudyUntilDate: toDateString(partial.plannedStudyUntilDate),
        })
      }
      if (submit.exclusion) await applyExclusion(partial.payment.id, submit.exclusion)
      const { check } = await payPartial(partial.payment.id, {
        amount: submit.amount,
        ...submit.reception,
      })
      notify.success(
        t('payments.messages.partialSuccess', { amount: formatSom(submit.amount) }),
      )
      partial.open = false
      partial.payment = null
      partial.calculation = null
      partial.plannedStudyUntilDate = null
      await load()
      checks.showChecks([check])
    } finally {
      partial.loading = false
    }
  }

  return {
    scope, rows, totalPages, loading, groupOptions, teacherOptions, filters,
    markDialog, partial, checks, exporter,
    init, load, applyFilters, setYear, setMonth, setStatus, setTeacher, search, setPage,
    openMarkAsPaid, closeMarkAsPaid, confirmMarkAsPaid,
    openPartial, closePartial, runCalculate, clearCalculation, confirmPartial,
  }
}
