import type { UserRole } from '@/shared/enums/user-role.enum'

/** The center summary embedded on an employee row from GET /users/employees. */
export interface UserCenter {
  id: number
  name: string
}

/** The dynamic role assigned to the employee (its display name comes from here). */
export interface UserRoleRef {
  id: number
  name: string
  baseRole: UserRole
}

/**
 * An employee (staff member) row from GET /users/employees. `salary` and
 * `commissionPercentage` may be null for roles that don't use them.
 */
export interface User {
  id: number
  firstName: string
  lastName: string
  login: string
  phone: string
  role: UserRole
  centerId: number
  salary: number | null
  commissionPercentage: number | null
  center?: UserCenter
  /** The assigned dynamic role; `name` is what the table shows. */
  userRole?: UserRoleRef
  /** `false` — blocked: cannot log in, history (salary, commission) is kept. */
  isActive?: boolean
  createdAt?: string
}
