import { computed, reactive, ref } from 'vue'
import { fetchUsers, createUser, updateUser, deleteUser, setUserActive } from '../api/users.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { User } from '../interfaces/user.interface'
import type { UserForm } from '../interfaces/user-form.interface'
import type { UsersParams } from '../interfaces/user-params.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { t } from '@/locales'

interface UsersFilters {
  name: string
  phone: string
  page: number
  perPage: number
}

/** List/state logic for the employees ("Ishchilar") page. */
export function useUsers() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<User[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const filters = reactive<UsersFilters>({ name: '', phone: '', page: 1, perPage: 10 })

  const modalOpen = ref(false)
  const editing = ref<User | null>(null)
  const deleteTarget = ref<User | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const params: UsersParams = {
        name: filters.name || undefined,
        phone: filters.phone || undefined,
        page: filters.page,
        perPage: filters.perPage,
      }
      const { data, meta } = await fetchUsers(params)
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  async function init(): Promise<void> {
    await load()
  }

  function applyFilters(): void {
    filters.page = 1
    load()
  }
  function search(value: string): void {
    filters.name = value
    applyFilters()
  }
  function searchPhone(value: string): void {
    filters.phone = value
    applyFilters()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openCreate(): void {
    editing.value = null
    modalOpen.value = true
  }
  function openEdit(user: User): void {
    editing.value = user
    modalOpen.value = true
  }

  async function submit(form: UserForm): Promise<void> {
    if (editing.value) await updateUser(editing.value.id, form)
    else await createUser(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }

  function requestDelete(user: User): void {
    deleteTarget.value = user
  }
  /** Block / unblock — a leaver is blocked instead of deleted (history stays). */
  const toggleTarget = ref<User | null>(null)
  const toggling = ref(false)
  function requestToggleActive(user: User): void {
    toggleTarget.value = user
  }
  async function confirmToggleActive(): Promise<void> {
    const user = toggleTarget.value
    if (!user || toggling.value) return
    toggling.value = true
    try {
      const isActive = user.isActive === false
      await setUserActive(user.id, { isActive })
      notify.success(t(isActive ? 'users.messages.unblocked' : 'users.messages.blocked'))
      toggleTarget.value = null
      await load()
    } finally {
      toggling.value = false
    }
  }

  const columns = computed<TableColumn[]>(() => [
    { key: 'id', label: t('users.table.id'), hideOnMobile: true },
    { key: 'firstName', label: t('users.table.firstName'), primary: true },
    { key: 'lastName', label: t('users.table.lastName') },
    { key: 'phone', label: t('users.table.phone') },
    { key: 'role', label: t('users.table.role') },
    { key: 'salary', label: t('users.table.salary'), align: 'right' },
    { key: 'commissionPercentage', label: t('users.table.commissionPercentage') },
    { key: 'center', label: t('users.table.center') },
  ])

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget.value) return
    await deleteUser(deleteTarget.value.id)
    notify.success(t('common.deleted'))
    deleteTarget.value = null
    await load()
  }

  return {
    scope, rows, totalPages, loading, filters,
    modalOpen, editing, deleteTarget,
    init, load, applyFilters, search, searchPhone, setPage,
    openCreate, openEdit, submit, requestDelete, confirmDelete,
    toggleTarget, toggling, requestToggleActive, confirmToggleActive, columns,
  }
}
