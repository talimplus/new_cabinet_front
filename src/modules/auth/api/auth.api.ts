import { http } from '@/shared/api/http'
import type { LoginForm } from '../interfaces/login-form.interface'
import type { RegisterForm } from '../interfaces/register-form.interface'
import type { LoginResponse, MeResponse } from '../interfaces/auth.interface'

export async function login(form: LoginForm): Promise<LoginResponse> {
  // Errors are surfaced on the form (email field), not as a global toast.
  const { data } = await http.post<LoginResponse>('/auth/login', form, { skipGlobalError: true })
  return data
}

export async function register(form: RegisterForm): Promise<void> {
  await http.post('/auth/register', form)
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout')
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await http.get<MeResponse>('/auth/me')
  return data
}
