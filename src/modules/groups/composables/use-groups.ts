import { ref, reactive, computed } from 'vue'
import { fetchGroups, createGroup, updateGroup, deleteGroup, changeGroupStatus } from '../api/groups.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { usePermissions } from '@/shared/composables/use-permissions'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString } from '@/shared/utils/format-date'
import { GroupStatus } from '../enums/group-status.enum'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm } from '../interfaces/group-form.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

/** A status-change 422 only re-opens the form when one of these is missing. */
const STATUS_FIELDS = ['endDate', 'roomId']

export function useGroups() {
  const scope = useScopeStore()
  const notify = useNotificationStore()
  const perms = usePermissions()

  const rows = ref<Group[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const filters = reactive<{ page: number; perPage: number; teacherId: number | null }>({
    page: 1,
    perPage: 10,
    teacherId: null,
  })

  // A teacher user never picks a teacher — the backend already scopes them.
  const canViewTeachers = computed(
    () => perms.canViewUsers.value || perms.canViewGroups.value || perms.canViewStudents.value,
  )
  const showTeacherFilter = computed(() => !perms.isTeacher.value && canViewTeachers.value)
  const teacherOptions = ref<SelectOption[]>([])

  const modalOpen = ref(false)
  const editing = ref<Group | null>(null)
  /** Field errors carried from a status-change 422 into the re-opened edit form. */
  const statusErrors = ref<Record<string, string> | null>(null)

  const pendingDelete = ref<Group | null>(null)
  const deleting = ref(false)
  const pendingFinish = ref<Group | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data, meta } = await fetchGroups({
        page: filters.page,
        perPage: filters.perPage,
        teacherId: filters.teacherId ?? undefined,
      })
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  async function loadTeachers(): Promise<void> {
    if (!showTeacherFilter.value) return
    const list = await optionalRequest(fetchTeachers(), [])
    teacherOptions.value = list.map((u) => ({
      label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      value: u.id,
    }))
    // Drop a stale selection that is no longer in the (re-scoped) list.
    if (filters.teacherId != null && !list.some((u) => u.id === filters.teacherId)) {
      filters.teacherId = null
    }
  }

  async function init(): Promise<void> {
    await Promise.all([load(), loadTeachers()])
  }

  function setTeacher(id: number | null): void {
    filters.teacherId = id
    filters.page = 1
    load()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openCreate(): void {
    editing.value = null
    statusErrors.value = null
    modalOpen.value = true
  }
  function openEdit(group: Group, errors: Record<string, string> | null = null): void {
    editing.value = group
    statusErrors.value = errors
    modalOpen.value = true
  }

  async function submit(form: GroupForm): Promise<void> {
    if (editing.value) await updateGroup(editing.value.id, form)
    else await createGroup(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }

  function askDelete(group: Group): void {
    pendingDelete.value = group
  }
  async function confirmDelete(): Promise<void> {
    if (!pendingDelete.value) return
    deleting.value = true
    try {
      await deleteGroup(pendingDelete.value.id)
      notify.success(t('common.deleted'))
      pendingDelete.value = null
      await load()
    } finally {
      deleting.value = false
    }
  }

  /** Finishing a group whose end date is still in the future asks first. */
  function setStatus(group: Group, status: GroupStatus): void {
    const endDate = group.endDate?.slice(0, 10)
    if (status === GroupStatus.FINISHED && endDate && endDate > toDateString(new Date())!) {
      pendingFinish.value = group
      return
    }
    applyStatus(group, status)
  }
  function confirmFinish(): void {
    if (!pendingFinish.value) return
    const group = pendingFinish.value
    pendingFinish.value = null
    applyStatus(group, GroupStatus.FINISHED)
  }

  async function applyStatus(group: Group, status: GroupStatus): Promise<void> {
    try {
      await changeGroupStatus(group.id, status)
      notify.success(t('groups.statusChange.success'))
      await load()
    } catch (error) {
      // A missing endDate/roomId comes back as a 422 — re-open the edit form
      // with the error under that field so the user can fix it in place.
      const mapped = mapBackendErrors(error)
      const fields = Object.fromEntries(
        Object.entries(mapped).filter(([k]) => STATUS_FIELDS.includes(k)),
      )
      if (Object.keys(fields).length) {
        notify.error(Object.values(fields).join(' · ') || t('groups.statusChange.endDateRequired'))
        openEdit(group, fields)
      }
      // Otherwise the http interceptor already showed the error toast.
    }
  }

  return {
    scope, rows, totalPages, loading, filters,
    showTeacherFilter, teacherOptions,
    modalOpen, editing, statusErrors,
    pendingDelete, deleting, pendingFinish,
    init, setPage, setTeacher,
    openCreate, openEdit, submit,
    askDelete, confirmDelete, setStatus, confirmFinish,
  }
}
