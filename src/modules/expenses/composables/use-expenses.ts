import { reactive, ref } from 'vue'
import { fetchExpenses, fetchExpense, createExpense, updateExpense, deleteExpense } from '../api/expenses.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { currentMonth } from '../utils/month'
import type { Expense } from '../interfaces/expense.interface'
import type { ExpenseForm } from '../interfaces/expense-form.interface'
import type { ExpensesParams } from '../interfaces/expense-params.interface'
import { t } from '@/locales'

interface ExpenseFilters {
  search: string
  forMonth: string
  page: number
  perPage: number
}

/** List/state logic for the expenses page. Fetches are gated on the center scope. */
export function useExpenses() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<Expense[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const filters = reactive<ExpenseFilters>({
    search: '', forMonth: currentMonth(), page: 1, perPage: 10,
  })

  const modalOpen = ref(false)
  const editing = ref<Expense | null>(null)
  const deleteTarget = ref<Expense | null>(null)
  const deleting = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const params: ExpensesParams = {
        forMonth: filters.forMonth || undefined,
        search: filters.search || undefined,
        page: filters.page,
        perPage: filters.perPage,
      }
      const { data, meta } = await fetchExpenses(params)
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
    filters.search = value
    applyFilters()
  }
  function setMonth(value: string): void {
    filters.forMonth = value
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
  /** Load the full record before editing (mirrors old cabinet_front). On failure
   *  the http interceptor toasts and the modal stays closed. */
  async function openEdit(expense: Expense): Promise<void> {
    editing.value = await fetchExpense(expense.id)
    modalOpen.value = true
  }

  async function submit(form: ExpenseForm): Promise<void> {
    if (editing.value) await updateExpense(editing.value.id, form)
    else await createExpense(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }

  function requestDelete(expense: Expense): void {
    deleteTarget.value = expense
  }
  function cancelDelete(): void {
    deleteTarget.value = null
  }
  async function confirmDelete(id: number): Promise<void> {
    if (deleting.value) return
    deleting.value = true
    try {
      await deleteExpense(id)
      notify.success(t('common.deleted'))
      deleteTarget.value = null
      await load()
    } finally {
      deleting.value = false
    }
  }

  return {
    scope, rows, totalPages, loading, filters, modalOpen, editing, deleteTarget, deleting,
    init, load, applyFilters, search, setMonth, setPage,
    openCreate, openEdit, submit, requestDelete, cancelDelete, confirmDelete,
  }
}
