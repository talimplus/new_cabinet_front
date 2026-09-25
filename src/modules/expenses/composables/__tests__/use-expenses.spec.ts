import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useExpenses } from '../use-expenses'
import {
  fetchExpenses as fetchExpensesApi,
  fetchExpense as fetchExpenseApi,
  createExpense as createExpenseApi,
  updateExpense as updateExpenseApi,
  deleteExpense as deleteExpenseApi,
} from '../../api/expenses.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { Expense } from '../../interfaces/expense.interface'
import type { ExpenseForm } from '../../interfaces/expense-form.interface'

vi.mock('../../api/expenses.api', () => ({
  fetchExpenses: vi.fn(),
  fetchExpense: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchExpensesApi)
const mockedFetchOne = vi.mocked(fetchExpenseApi)
const mockedCreate = vi.mocked(createExpenseApi)
const mockedUpdate = vi.mocked(updateExpenseApi)
const mockedDelete = vi.mocked(deleteExpenseApi)

const CENTER_ID = 5

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    centerId: CENTER_ID,
    name: 'Ijara',
    amount: 1000000,
    description: '',
    forMonth: '2026-09',
    createdAt: '2026-09-01',
    ...overrides,
  }
}

const form: ExpenseForm = {
  centerId: CENTER_ID,
  name: 'Ijara',
  amount: 1000000,
  description: '',
  forMonth: '2026-09',
}

describe('useExpenses', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue({
      data: [makeExpense()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 2 },
    })
    mockedDelete.mockResolvedValue(undefined)
  })

  describe('load()', () => {

    it('builds params from scope + filters and strips empty search', async () => {
      const e = useExpenses()
      e.filters.forMonth = '2026-08'
      e.applyFilters()
      await flushPromises()

      expect(mockedFetch).toHaveBeenCalledWith({
        forMonth: '2026-08',
        search: undefined,
        page: 1,
        perPage: 10,
      })
      expect(e.rows.value).toHaveLength(1)
      expect(e.totalPages.value).toBe(2)
    })

    it('passes the search term and page through', async () => {
      const e = useExpenses()
      e.search('ijara')
      await flushPromises()
      e.setPage(2)
      await flushPromises()

      expect(mockedFetch).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'ijara', page: 2 }),
      )
    })
  })

  describe('submit()', () => {
    it('creates when not editing, notifies success and closes the modal', async () => {
      const e = useExpenses()
      e.openCreate()
      mockedCreate.mockResolvedValueOnce(makeExpense({ id: 9 }))

      await e.submit(form)
      await flushPromises()

      expect(mockedCreate).toHaveBeenCalledWith(form)
      expect(mockedUpdate).not.toHaveBeenCalled()
      expect(e.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing expense by id', async () => {
      const e = useExpenses()
      const editing = makeExpense({ id: 42 })
      mockedFetchOne.mockResolvedValueOnce(editing)
      await e.openEdit(editing)
      mockedUpdate.mockResolvedValueOnce(editing)

      await e.submit(form)
      await flushPromises()

      expect(mockedCreate).not.toHaveBeenCalled()
      expect(mockedUpdate).toHaveBeenCalledWith(42, form)
    })
  })

  describe('openEdit()', () => {
    it('fetches the full record by id and uses it as the editing value', async () => {
      const e = useExpenses()
      const row = makeExpense({ id: 42, amount: '999.00' })
      const full = makeExpense({ id: 42, amount: '999.00', description: 'To’liq izoh' })
      mockedFetchOne.mockResolvedValueOnce(full)

      const promise = e.openEdit(row)
      expect(e.modalOpen.value).toBe(false)
      await promise

      expect(mockedFetchOne).toHaveBeenCalledWith(42)
      expect(e.editing.value).toEqual(full)
      expect(e.modalOpen.value).toBe(true)
    })
  })

  describe('delete flow', () => {
    it('requestDelete stores the target; confirmDelete deletes, notifies and clears it', async () => {
      const e = useExpenses()
      const target = makeExpense({ id: 7 })

      e.requestDelete(target)
      expect(e.deleteTarget.value).toEqual(target)

      await e.confirmDelete(7)
      await flushPromises()

      expect(mockedDelete).toHaveBeenCalledWith(7)
      expect(e.deleteTarget.value).toBeNull()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('cancelDelete clears the target without calling the api', () => {
      const e = useExpenses()
      e.requestDelete(makeExpense())
      e.cancelDelete()

      expect(e.deleteTarget.value).toBeNull()
      expect(mockedDelete).not.toHaveBeenCalled()
    })

    it('ignores a second confirmDelete while the first is in flight', async () => {
      let resolve!: () => void
      mockedDelete.mockReturnValueOnce(new Promise<void>((r) => (resolve = r)))
      const e = useExpenses()

      const first = e.confirmDelete(7)
      expect(e.deleting.value).toBe(true)
      await e.confirmDelete(7)
      resolve()
      await first
      await flushPromises()

      expect(mockedDelete).toHaveBeenCalledTimes(1)
      expect(e.deleting.value).toBe(false)
    })
  })
})
