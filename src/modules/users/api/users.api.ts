import { http } from '@/shared/api/http'
import type { Employee, EmployeesParams, TeachersParams } from '../interfaces/employee.interface'
import type { User } from '../interfaces/user.interface'
import type { UserForm, UserActiveForm, UserDismissForm } from '../interfaces/user-form.interface'
import type { UsersParams } from '../interfaces/user-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

/** Lightweight employee list (used by other modules for teacher/staff dropdowns). */
export async function fetchEmployees(params: EmployeesParams): Promise<PaginatedResponse<Employee>> {
  const { data } = await http.get<PaginatedResponse<Employee>>('/users/employees', { params })
  return data
}

/** GET /users/teachers — bare array (not paginated) for teacher filters/selects. */
export async function fetchTeachers(params?: TeachersParams): Promise<Employee[]> {
  const { data } = await http.get<Employee[]>('/users/teachers', { params })
  return Array.isArray(data) ? data : []
}

/** GET /users/employees — full employee rows for the Ishchilar management page. */
export async function fetchUsers(params: UsersParams): Promise<PaginatedResponse<User>> {
  const { data } = await http.get<PaginatedResponse<User>>('/users/employees', { params })
  return data
}

export async function createUser(form: UserForm): Promise<User> {
  const { data } = await http.post<User>('/users', form)
  return data
}

export async function updateUser(id: number, form: UserForm): Promise<User> {
  const { data } = await http.put<User>(`/users/${id}`, form)
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(`/users/${id}`)
}

/**
 * PUT /users/{id}/active — block / unblock an employee. A leaver is blocked,
 * not deleted: deleting would erase their salary and commission history.
 */
export async function setUserActive(id: number, form: UserActiveForm): Promise<User> {
  const { data } = await http.put<User>(`/users/${id}/active`, form)
  return data
}

/**
 * PUT /users/{id}/dismiss — dismiss an employee: the account is blocked and the
 * row moves to the archive; salary, advances, bonuses, groups and receipts stay.
 * A teacher with unfinished groups gets a 400 (move the groups first).
 */
export async function dismissUser(id: number, form: UserDismissForm): Promise<User> {
  const { data } = await http.put<User>(`/users/${id}/dismiss`, form)
  return data
}

/** PUT /users/{id}/reinstate — take a dismissed employee back (unblocked, out of the archive). */
export async function reinstateUser(id: number): Promise<User> {
  const { data } = await http.put<User>(`/users/${id}/reinstate`)
  return data
}
