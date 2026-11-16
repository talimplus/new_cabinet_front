import { computed, reactive, ref } from 'vue'
import { fetchTeacherDashboard } from '../api/teacher-dashboard.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { StudentPayFilter } from '../enums/student-pay-filter.enum'
import { useGroupStudents } from './use-group-students'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useQueryState } from '@/shared/composables/use-query-state'
import { QueryParam } from '@/shared/enums/query-param.enum'
import { optionalRequest } from '@/shared/permissions/optional-request'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TeacherDashboardResponse } from '../interfaces/teacher-dashboard.interface'
import type { GroupStudentsFilters } from '../interfaces/group-panel.interface'

const currentMonth = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Teacher dashboard state. A teacher sees their own groups; anyone else
 * (admin, manager) picks a teacher first — the backend 422s without one, so
 * nothing is requested until a teacher is chosen. Month, teacher, the student
 * search, the group picker and the status tab live in the URL.
 */
export function useTeacherDashboard() {
  const { isTeacher } = usePermissions()
  const data = ref<TeacherDashboardResponse | null>(null)
  const loading = ref(false)
  const teacherOptions = ref<SelectOption[]>([])

  const filters = reactive({
    month: currentMonth(),
    teacherId: null as number | null,
    search: '',
    groupId: null as number | null,
    status: StudentPayFilter.ALL as StudentPayFilter,
  })
  useQueryState(filters, {
    kinds: { month: QueryParam.DATE_STRING, teacherId: QueryParam.NUMBER, groupId: QueryParam.NUMBER },
    oneOf: { status: Object.values(StudentPayFilter) },
    debounce: ['search'],
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
    filters.groupId = null // another teacher's groups
    void load()
  }

  const list = useGroupStudents(data, filters)
  /** Search / group / status tab — client-side only, nothing is refetched. */
  function patchFilters(patch: Partial<GroupStudentsFilters>): void {
    if (patch.search !== undefined) filters.search = patch.search
    if (patch.groupId !== undefined) filters.groupId = patch.groupId
    if (patch.status !== undefined) filters.status = patch.status as StudentPayFilter
  }

  return {
    isTeacher, data, loading, filters, teacherOptions, needsTeacher, list,
    init, load, setMonth, setTeacher, patchFilters,
  }
}
