import { ref, computed } from 'vue'
import { fetchGroupById } from '../api/groups.api'
import { fetchStudents } from '@/modules/students/api/students.api'
import { usePermissions } from '@/shared/composables/use-permissions'
import { GroupTab, GROUP_TAB_LABEL_KEYS } from '../enums/group-tab.enum'
import type { Group } from '../interfaces/group.interface'
import type { Student } from '@/modules/students/interfaces/student.interface'

export interface GroupTabItem {
  key: GroupTab
  labelKey: string
}

/**
 * Page-level state for the group detail view: loads the group + its students
 * once (shared by the Attendance and Students tabs), owns the active tab, and
 * exposes permission-derived flags. All heavy logic lives here so the view and
 * tab components stay thin.
 */
export function useGroupDetail(groupId: number) {
  const perms = usePermissions()

  const group = ref<Group | null>(null)
  const students = ref<Student[]>([])
  const loading = ref(false)
  const loadingStudents = ref(false)

  const activeTab = ref<GroupTab>(
    perms.canViewAttendance.value ? GroupTab.ATTENDANCE : GroupTab.STUDENTS,
  )

  const isOwnGroup = computed(
    () => !!group.value?.teacher && group.value.teacher.id === perms.userId.value,
  )
  const canEditPlan = computed(() => perms.canEditLessonPlan(isOwnGroup.value))
  // The transfer modal loads /groups/all, so it needs the groups read key too.
  const canTransfer = computed(
    () => perms.canTransferStudents.value && perms.canViewGroups.value,
  )

  const tabs = computed<GroupTabItem[]>(() => {
    const list: GroupTabItem[] = []
    if (perms.canViewAttendance.value)
      list.push({ key: GroupTab.ATTENDANCE, labelKey: GROUP_TAB_LABEL_KEYS[GroupTab.ATTENDANCE] })
    if (perms.canViewGroupPlan.value)
      list.push({ key: GroupTab.PLAN, labelKey: GROUP_TAB_LABEL_KEYS[GroupTab.PLAN] })
    if (perms.canViewStudents.value)
      list.push({ key: GroupTab.STUDENTS, labelKey: GROUP_TAB_LABEL_KEYS[GroupTab.STUDENTS] })
    list.push({ key: GroupTab.INFO, labelKey: GROUP_TAB_LABEL_KEYS[GroupTab.INFO] })
    return list
  })

  async function loadStudents(): Promise<void> {
    loadingStudents.value = true
    try {
      const { data } = await fetchStudents({
        centerId: group.value?.center?.id,
        groupId,
        page: 1,
        perPage: 100,
      })
      students.value = data
    } finally {
      loadingStudents.value = false
    }
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      group.value = await fetchGroupById(groupId)
      await loadStudents()
    } finally {
      loading.value = false
    }
  }

  return {
    group,
    students,
    loading,
    loadingStudents,
    activeTab,
    tabs,
    isOwnGroup,
    canEditPlan,
    canTransfer,
    load,
  }
}
