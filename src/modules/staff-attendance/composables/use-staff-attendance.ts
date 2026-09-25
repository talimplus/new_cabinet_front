import { ref, reactive, computed } from 'vue'
import {
  fetchStaffAttendance,
  fetchStaffAttendanceReport,
  createManualAttendance,
  confirmStaffAttendance,
  deleteStaffAttendance,
} from '../api/staff-attendance.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { useNotificationStore } from '@/stores/notification.store'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { toDateString } from '@/shared/utils/format-date'
import type { StaffAttendance } from '@/shared/interfaces/staff-attendance.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { StaffAttendanceReport } from '../interfaces/staff-attendance-report.interface'
import type { ManualAttendanceForm } from '../interfaces/manual-attendance-form.interface'
import { t } from '@/locales'

function firstOfMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

interface ManualState {
  open: boolean
  userId: number | null
  workDate: string
  checkInTime: string
  note: string
  saving: boolean
}

/** The `/staff-attendance` admin page: the daily-records log, filters, per-employee report, and manual entry. */
export function useStaffAttendance() {
  const notify = useNotificationStore()

  const tab = ref<'log' | 'report'>('log')
  const filters = reactive({
    from: firstOfMonth(),
    to: toDateString(new Date())!,
    userId: null as number | null,
    onlyLate: false,
    onlyFlagged: false,
    page: 1,
    perPage: 20,
  })

  const rows = ref<StaffAttendance[]>([])
  const total = ref(0)
  const loadingLog = ref(false)
  const totalPages = computed(() => Math.ceil(total.value / filters.perPage) || 1)

  const report = ref<StaffAttendanceReport | null>(null)
  const loadingReport = ref(false)
  const centerNotConfigured = computed(() => !!report.value?.centerNotConfigured)

  const employees = ref<SelectOption[]>([])

  const pendingDelete = ref<StaffAttendance | null>(null)
  const deleting = ref(false)

  const manual = reactive<ManualState>({
    open: false, userId: null, workDate: toDateString(new Date())!, checkInTime: '09:00', note: '', saving: false,
  })

  async function loadLog(): Promise<void> {
    loadingLog.value = true
    try {
      const { data, meta } = await fetchStaffAttendance({
        page: filters.page,
        perPage: filters.perPage,
        userId: filters.userId ?? undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        onlyLate: filters.onlyLate || undefined,
        onlyFlagged: filters.onlyFlagged || undefined,
      })
      rows.value = data
      total.value = meta.total
    } finally {
      loadingLog.value = false
    }
  }

  async function loadReport(): Promise<void> {
    if (!filters.from || !filters.to) return
    loadingReport.value = true
    try {
      report.value = await fetchStaffAttendanceReport(filters.from, filters.to)
    } finally {
      loadingReport.value = false
    }
  }

  async function loadEmployees(): Promise<void> {
    const list = await optionalRequest(fetchTeachers(), [])
    employees.value = list.map((u) => ({
      label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      value: u.id,
    }))
  }

  async function init(): Promise<void> {
    await Promise.all([loadLog(), loadReport(), loadEmployees()])
  }

  /** Date changes affect both tabs; the log-only filters reload just the log. */
  function reload(): void {
    filters.page = 1
    loadLog()
    loadReport()
  }
  function reloadLog(): void {
    filters.page = 1
    loadLog()
  }
  function setPage(page: number): void {
    filters.page = page
    loadLog()
  }

  async function confirm(row: StaffAttendance): Promise<void> {
    await confirmStaffAttendance(row.id)
    notify.success(t('staffAttendance.messages.confirmed'))
    await loadLog()
  }

  function askDelete(row: StaffAttendance): void {
    pendingDelete.value = row
  }
  async function confirmDelete(): Promise<void> {
    if (!pendingDelete.value) return
    deleting.value = true
    try {
      await deleteStaffAttendance(pendingDelete.value.id)
      notify.success(t('staffAttendance.messages.deleted'))
      pendingDelete.value = null
      await Promise.all([loadLog(), loadReport()])
    } finally {
      deleting.value = false
    }
  }

  function openManual(): void {
    Object.assign(manual, {
      open: true, userId: null, workDate: toDateString(new Date())!, checkInTime: '09:00', note: '',
    })
  }
  async function submitManual(): Promise<void> {
    if (!manual.userId) return
    manual.saving = true
    try {
      const form: ManualAttendanceForm = {
        userId: manual.userId,
        workDate: manual.workDate,
        checkInTime: manual.checkInTime,
        note: manual.note.trim() || undefined,
      }
      await createManualAttendance(form)
      notify.success(t('staffAttendance.messages.manualSaved'))
      manual.open = false
      await Promise.all([loadLog(), loadReport()])
    } finally {
      manual.saving = false
    }
  }

  return {
    tab, filters, rows, totalPages, loadingLog,
    report, loadingReport, centerNotConfigured, employees,
    pendingDelete, deleting, manual,
    init, reload, reloadLog, setPage,
    confirm, askDelete, confirmDelete, openManual, submitManual,
  }
}
