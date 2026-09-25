/**
 * POST /users and PUT /users/:id body. `password` is required on create and
 * omitted on edit (a blank password means "leave unchanged"). Roles are dynamic,
 * so the employee is assigned a `roleId` (required by the backend); the old
 * `role` enum string is no longer sent — the server derives it from the role.
 */
export interface UserForm {
  firstName: string
  lastName: string
  login: string
  phone: string
  password?: string
  /** The chosen dynamic role (`Role.id` from GET /roles). */
  roleId: number
  centerId: number
  salary?: number
  commissionPercentage?: number
}
