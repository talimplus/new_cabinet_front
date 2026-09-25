/** POST /auth/register request body. */
export interface RegisterForm {
  organizationName: string
  centerName: string
  firstName: string
  lastName: string
  phone: string
  password: string
  /** Optional — sent as the account's email + login (mirrors backend example). */
  email?: string
  login?: string
}
