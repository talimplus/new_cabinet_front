import type { UserRole } from '@/shared/enums/user-role.enum'

export interface Employee {
  id: number
  firstName?: string
  lastName?: string
  phone?: string
  role?: UserRole
}

export interface EmployeesParams {
  centerId: number
  name?: string
  phone?: string
  page?: number
  perPage?: number
}

/** Query params for GET /users/teachers (returns a bare array, not a page). */
export interface TeachersParams {
  centerId?: number
  name?: string
}
