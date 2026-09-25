/** The employee a StaffSalary row belongs to (nested in the salary response). */
export interface StaffUser {
  id: number
  firstName: string
  lastName: string
  login: string
  phone: string
  role: string
  salary: number
  commissionPercentage: number | null
  createdAt: string
  /** Admin-defined role ("Kassir"); shown instead of the base `role`. */
  userRole?: { id: number; key: string; name: string } | null
}
