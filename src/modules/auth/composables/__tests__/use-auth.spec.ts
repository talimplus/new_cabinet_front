import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '../use-auth'
import { useUserStore } from '@/stores/user.store'
import { useNotificationStore } from '@/stores/notification.store'
import { register as registerApi } from '../../api/auth.api'
import { UserRole } from '@/shared/enums/user-role.enum'

// Router is mocked so useAuth needs no real injection context in jsdom.
const replace = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ replace }) }))

// register hits the network otherwise — mock the api module.
vi.mock('../../api/auth.api', () => ({ register: vi.fn() }))

const mockedRegister = vi.mocked(registerApi)

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('submitLogin logs in and redirects to the role home', async () => {
    const store = useUserStore()
    const user = { id: 1, email: 'a@b.uz', role: UserRole.ADMIN, centerId: 2, roleId: 2, roleName: 'Administrator', permissions: ['*'] }
    const loginSpy = vi.spyOn(store, 'login').mockResolvedValueOnce(user)

    const { submitLogin } = useAuth()
    await submitLogin({ email: 'a@b.uz', password: 'secret' })

    expect(loginSpy).toHaveBeenCalledWith({ email: 'a@b.uz', password: 'secret' })
    expect(replace).toHaveBeenCalledWith('/')
  })

  it('submitLogin shows the message on the email field when there are no field errors', async () => {
    const store = useUserStore()
    const error = { response: { status: 401, data: { message: 'Login yoki parol xato' } } }
    vi.spyOn(store, 'login').mockRejectedValueOnce(error)

    const { submitLogin, formRef } = useAuth()
    const setErrors = vi.fn()
    const setFieldError = vi.fn()
    formRef.value = { setBackendErrors: vi.fn(), setErrors, setFieldError }

    await submitLogin({ email: 'a@b.uz', password: 'wrong' })

    expect(setFieldError).toHaveBeenCalledWith('email', 'Login yoki parol xato')
    expect(setErrors).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('submitLogin maps backend field errors onto the fields', async () => {
    const store = useUserStore()
    const error = { response: { status: 422, data: { errors: { email: ['Email topilmadi'] } } } }
    vi.spyOn(store, 'login').mockRejectedValueOnce(error)

    const { submitLogin, formRef } = useAuth()
    const setErrors = vi.fn()
    const setFieldError = vi.fn()
    formRef.value = { setBackendErrors: vi.fn(), setErrors, setFieldError }

    await submitLogin({ email: 'a@b.uz', password: 'wrong' })

    expect(setErrors).toHaveBeenCalledWith({ email: 'Email topilmadi' })
    expect(setFieldError).not.toHaveBeenCalled()
  })

  it('submitRegister builds the form with login=email, notifies and redirects to /login', async () => {
    mockedRegister.mockResolvedValueOnce(undefined)
    const notify = useNotificationStore()
    const successSpy = vi.spyOn(notify, 'success')

    const { submitRegister } = useAuth()
    await submitRegister({
      organizationName: 'Acme',
      centerName: 'Center 1',
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '901234567',
      password: 'secret6',
      email: 'a@b.uz',
    })

    expect(mockedRegister).toHaveBeenCalledWith({
      organizationName: 'Acme',
      centerName: 'Center 1',
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '901234567',
      password: 'secret6',
      email: 'a@b.uz',
      login: 'a@b.uz',
    })
    expect(successSpy).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith('/login')
  })
})
