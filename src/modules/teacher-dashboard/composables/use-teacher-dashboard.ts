import { computed, reactive, ref } from 'vue'
import { fetchTeacherDashboard } from '../api/teacher-dashboard.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import { DebtorFilter } from '../enums/debtor-filter.enum'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useQueryState } from '@/shared/composables/use-query-state'
import { QueryParam } from '@/shared/enums/query-param.enum'
import { optionalRequest } from '@/shared/permissions/optional-request'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TeacherDashboardResponse } from '../interfaces/teacher-dashboard.interface'

const currentMonth = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Teacher dashboard state. A teacher sees their own groups; anyone else
 * (admin, manager) picks a teacher first — the backend 422s without one, so
 * nothing is requested until a teacher is chosen. Month, teacher and the
 * debtors tab live in the URL.
 */
export function useTeacherDashboard() {
  const { isTeacher } = usePermissions()
  const data = ref<TeacherDashboardResponse | null>(null)
  const loading = ref(false)
  const teacherOptions = ref<SelectOption[]>([])

  const filters = reactive({
    month: currentMonth(),
    teacherId: null as number | null,
    debtors: DebtorFilter.ALL as DebtorFilter,
  })
  useQueryState(filters, {
    kinds: { month: QueryParam.DATE_STRING, teacherId: QueryParam.NUMBER },
    oneOf: { debtors: Object.values(DebtorFilter) },
    onExternalChange: () => void load(),
  })

  /** Non-teachers need a teacher picked before anything loads. */
  const needsTeacher = computed(() => !isTeacher.value && filters.teacherId == null)

  async function load(): Promise<void> {
    if (needsTeacher.value) {
      data.value = null
      return
    }
    loading.value = true
    try {
      data.value = await fetchTeacherDashboard({
        month: filters.month || undefined,
        teacherId: isTeacher.value ? undefined : (filters.teacherId ?? undefined),
      })
    } catch {
      data.value = null // toasted by the interceptor
    } finally {
      loading.value = false
    }
  }

  async function init(): Promise<void> {
    if (!isTeacher.value) {
      const list = await optionalRequest(fetchTeachers(), [])
      teacherOptions.value = list.map((x) => ({
        label: `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim() || `#${x.id}`,
        value: x.id,
      }))
    }
    await load()
  }

  function setMonth(month: string): void {
    filters.month = month || currentMonth()
    void load()
  }
  function setTeacher(id: number | null): void {
    filters.teacherId = id
    void load()
  }

  const debtors = computed(() => {
    const list = data.value?.debtors ?? []
    if (filters.debtors === DebtorFilter.UNPAID) return list.filter((d) => d.monthStatus === PaymentStatus.UNPAID)
    if (filters.debtors === DebtorFilter.PARTIAL) return list.filter((d) => d.monthStatus === PaymentStatus.PARTIAL)
    return list
  })

  return { isTeacher, data, loading, filters, teacherOptions, needsTeacher, debtors, init, load, setMonth, setTeacher }
}
