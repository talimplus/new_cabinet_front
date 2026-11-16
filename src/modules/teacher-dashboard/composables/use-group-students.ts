import { computed, ref, watch, type Ref } from 'vue'
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import { phoneDigits } from '@/shared/utils/format-phone'
import { StudentPayState } from '../enums/student-pay-state.enum'
import { StudentPayFilter, STUDENT_PAY_FILTER_LABEL_KEYS } from '../enums/student-pay-filter.enum'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { GroupPanel, GroupStudentRow, GroupStudentsFilters } from '../interfaces/group-panel.interface'
import type { TeacherDashboardResponse, TeacherGroupStudent } from '../interfaces/teacher-dashboard.interface'

/**
 * The month state of one student. "Pending" follows the payments module: the
 * whole month is handed in (paid + waiting receipts cover the charge), only
 * the admin's confirmation is missing.
 */
export function payStateOf(s: TeacherGroupStudent): StudentPayState {
  if (!s.monthStatus) return StudentPayState.NONE
  if (s.monthStatus === PaymentStatus.PAID) return StudentPayState.PAID
  if (s.pendingAmount > 0 && s.amountPaid + s.pendingAmount >= s.amountDue) return StudentPayState.PENDING
  return s.monthStatus === PaymentStatus.PARTIAL ? StudentPayState.PARTIAL : StudentPayState.UNPAID
}

const matchesTab = (row: GroupStudentRow, tab: string): boolean => {
  if (tab === StudentPayFilter.ALL) return true
  if (tab === StudentPayFilter.DEBT) return row.totalDebt > 0
  return row.state === (tab as string)
}

/**
 * Groups as panels, each with its students for the month. The search box
 * matches a student's name or phone, or a group's name (then the whole group
 * stays). Tabs filter by the month state; their badges count what the search
 * and group picker leave. Panels open by themselves while narrowing.
 */
export function useGroupStudents(data: Ref<TeacherDashboardResponse | null>, filters: GroupStudentsFilters) {
  const rowsOf = (students: TeacherGroupStudent[]): GroupStudentRow[] =>
    students.map((s) => ({ ...s, key: `${s.studentId}-${s.groupId}`, state: payStateOf(s) }))

  const query = computed(() => filters.search.trim().toLowerCase())
  const studentMatches = (s: GroupStudentRow): boolean => {
    const q = query.value
    if (!q) return true
    const a = `${s.lastName ?? ''} ${s.firstName ?? ''}`.toLowerCase()
    const b = `${s.firstName ?? ''} ${s.lastName ?? ''}`.toLowerCase()
    const digits = phoneDigits(q)
    return a.includes(q) || b.includes(q) || (digits.length >= 3 && phoneDigits(s.phone).includes(digits))
  }

  /** Search + group picker applied; status tab not yet. */
  const searched = computed<GroupPanel[]>(() =>
    (data.value?.groups ?? [])
      .filter((g) => filters.groupId == null || g.id === filters.groupId)
      .map((g) => {
        const all = rowsOf(g.students ?? [])
        const groupHit = !!query.value && g.name.toLowerCase().includes(query.value)
        return { group: g, rows: groupHit ? all : all.filter(studentMatches) }
      }),
  )

  const narrowing = computed(() => !!query.value || filters.status !== StudentPayFilter.ALL)

  const panels = computed<GroupPanel[]>(() =>
    searched.value
      .map((p) => ({ group: p.group, rows: p.rows.filter((r) => matchesTab(r, filters.status)) }))
      // While narrowing, a group with nothing left is noise — unless it was picked.
      .filter((p) => !narrowing.value || p.rows.length > 0 || filters.groupId === p.group.id),
  )

  const tabs = computed<TabItem[]>(() => {
    const rows = searched.value.flatMap((p) => p.rows)
    return Object.values(StudentPayFilter).map((key) => ({
      key,
      labelKey: STUDENT_PAY_FILTER_LABEL_KEYS[key],
      badge: key === StudentPayFilter.ALL ? undefined : rows.filter((r) => matchesTab(r, key)).length || undefined,
      badgeAlert: key === StudentPayFilter.DEBT || key === StudentPayFilter.UNPAID,
    }))
  })

  const groupOptions = computed<SelectOption[]>(() =>
    (data.value?.groups ?? []).map((g) => ({ label: g.name, value: g.id })),
  )

  /** Students with any unpaid month, each counted once. */
  const debtorsCount = computed(() => {
    const ids = new Set<number>()
    for (const g of data.value?.groups ?? []) for (const s of g.students ?? []) if (s.totalDebt > 0) ids.add(s.studentId)
    return ids.size
  })

  // Open panels: the first group by default, every visible one while narrowing.
  const openIds = ref<Set<number>>(new Set())
  watch(
    [() => data.value, query, () => filters.status, () => filters.groupId],
    () => {
      const ids = panels.value.map((p) => p.group.id)
      openIds.value = new Set(narrowing.value || filters.groupId != null ? ids : ids.slice(0, 1))
    },
    { immediate: true },
  )
  const isOpen = (id: number): boolean => openIds.value.has(id)
  function setOpen(id: number, open: boolean): void {
    const next = new Set(openIds.value)
    if (open) next.add(id)
    else next.delete(id)
    openIds.value = next
  }

  return { panels, tabs, groupOptions, debtorsCount, narrowing, isOpen, setOpen }
}
