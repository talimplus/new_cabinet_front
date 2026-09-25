import { http } from '@/shared/api/http'
import type { Expense } from '../interfaces/expense.interface'
import type { ExpenseForm } from '../interfaces/expense-form.interface'
import type { ExpensesParams } from '../interfaces/expense-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export async function fetchExpenses(params: ExpensesParams): Promise<PaginatedResponse<Expense>> {
  const { data } = await http.get<PaginatedResponse<Expense>>('/expenses', { params })
  return data
}

export async function fetchExpense(id: number): Promise<Expense> {
  const { data } = await http.get<Expense>(`/expenses/${id}`)
  return data
}

export async function createExpense(form: ExpenseForm): Promise<Expense> {
  const { data } = await http.post<Expense>('/expenses', form)
  return data
}

export async function updateExpense(id: number, form: ExpenseForm): Promise<Expense> {
  const { data } = await http.put<Expense>(`/expenses/${id}`, form)
  return data
}

export async function deleteExpense(id: number): Promise<void> {
  await http.delete(`/expenses/${id}`)
}
