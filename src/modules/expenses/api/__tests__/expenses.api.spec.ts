import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchExpenses,
  fetchExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../expenses.api'
import { http } from '@/shared/api/http'
import type { Expense } from '../../interfaces/expense.interface'
import type { ExpenseForm } from '../../interfaces/expense-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const form: ExpenseForm = {
  centerId: 1,
  name: 'Ijara',
  amount: 1500000,
  description: 'Ofis ijarasi',
  forMonth: '2026-09',
}

describe('expenses.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchExpenses GETs /expenses with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: 'Ijara' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchExpenses({ centerId: 1, forMonth: '2026-09', page: 1, perPage: 10 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/expenses', {
      params: { centerId: 1, forMonth: '2026-09', page: 1, perPage: 10 },
    })
    expect(result).toEqual(body)
  })

  it('fetchExpense GETs /expenses/{id} and returns the expense', async () => {
    const expense = { id: 3, name: 'Ijara' } as Expense
    mockedHttp.get.mockResolvedValueOnce({ data: expense })

    const result = await fetchExpense(3)

    expect(mockedHttp.get).toHaveBeenCalledWith('/expenses/3')
    expect(result).toEqual(expense)
  })

  it('createExpense POSTs the form to /expenses and returns the created expense', async () => {
    const created = { id: 10, name: 'Ijara' } as Expense
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createExpense(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/expenses', form)
    expect(result).toEqual(created)
  })

  it('updateExpense PUTs the form to /expenses/{id} and returns the updated expense', async () => {
    const updated = { id: 5, name: 'Ijara' } as Expense
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateExpense(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/expenses/5', form)
    expect(result).toEqual(updated)
  })

  it('deleteExpense DELETEs /expenses/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteExpense(8)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/expenses/8')
  })
})
