import { reactive, ref } from 'vue'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { User } from '../interfaces/user.interface'
import type { UserForm } from '../interfaces/user-form.interface'
import type { UsersParams } from '../interfaces/user-params.interface'
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
  }
}
