import { computed, ref } from 'vue'
import { fetchStudentAttendance } from '../api/student-attendance.api'
import type {
  StudentAttendanceGroup,
  StudentAttendanceItem,
} from '../interfaces/student-attendance.interface'

/** Marks shown at first; "show more" adds the same again. */
export const ATTENDANCE_PAGE = 30

/**
 * The student's attendance across every group — for the "when did they come"
 * talk with parents, also after a transfer (the old group's marks stay).
 * A group chip narrows the list to that group.
 */
export function useStudentAttendance(getStudentId: () => number | null) {
  const groups = ref<StudentAttendanceGroup[]>([])
  const items = ref<StudentAttendanceItem[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const groupId = ref<number | null>(null)
  const limit = ref(ATTENDANCE_PAGE)

  async function load(): Promise<void> {
    const id = getStudentId()
    if (!id) return
    loading.value = true
    failed.value = false
    try {
      const data = await fetchStudentAttendance(id)
      groups.value = data.groups
      items.value = data.items
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  const filtered = computed(() =>
    groupId.value == null ? items.value : items.value.filter((i) => i.groupId === groupId.value),
  )
  const visible = computed(() => filtered.value.slice(0, limit.value))
  const remaining = computed(() => Math.max(0, filtered.value.length - limit.value))

  function selectGroup(id: number | null): void {
    groupId.value = groupId.value === id ? null : id
    limit.value = ATTENDANCE_PAGE
  }
  function showMore(): void {
    limit.value += ATTENDANCE_PAGE
  }

  return { groups, items, loading, failed, groupId, visible, remaining, load, selectGroup, showMore }
}
