import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import type { AxiosError } from 'axios'
import { useUserStore } from '@/stores/user.store'
import { useNotificationStore } from '@/stores/notification.store'
import { t } from '@/locales'
import { resolveHome } from '@/shared/permissions/resolve-home'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { resolveErrorMessage } from '@/shared/utils/error-message'
import { register as registerApi } from '../api/auth.api'
import type { RegisterForm } from '../interfaces/register-form.interface'

/** The subset of the UiForm instance the auth views drive. */
interface AuthFormRef {
  setBackendErrors: (error: unknown) => void
  setErrors: (errors: Record<string, string>) => void
  setFieldError: (field: string, message: string) => void
}

/** Login/register form logic for the auth views (keeps views thin). */
export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()
  const notify = useNotificationStore()

  const loading = ref(false)
  const formRef = ref<AuthFormRef | null>(null)

  // Computed so the messages re-resolve when the UI language changes.
  const loginSchema = computed(() =>
    toTypedSchema(
      z.object({
        email: z
          .string()
          .min(1, t('auth.validation.emailRequired'))
          .email(t('auth.validation.emailInvalid')),
        password: z.string().min(1, t('auth.validation.passwordRequired')),
      }),
    ),
  )

  const registerSchema = computed(() =>
    toTypedSchema(
      z.object({
        organizationName: z.string().min(1, t('auth.validation.organizationRequired')),
        centerName: z.string().min(1, t('auth.validation.centerRequired')),
        firstName: z.string().min(1, t('auth.validation.firstNameRequired')),
        lastName: z.string().min(1, t('auth.validation.lastNameRequired')),
        phone: z.string().min(9, t('auth.validation.phoneInvalid')),
        email: z
          .string()
          .min(1, t('auth.validation.emailRequired'))
          .email(t('auth.validation.emailInvalid')),
        password: z.string().min(6, t('auth.validation.passwordMin')),
      }),
    ),
  )

  async function submitLogin(values: GenericObject): Promise<void> {
    loading.value = true
    try {
      const user = await userStore.login({
        email: values.email as string,
        password: values.password as string,
      })
      await router.replace(resolveHome(user.permissions))
    } catch (error) {
      // Login opts out of the global toast (skipGlobalError), so surface the
      // error here: field errors onto their fields, otherwise the message on
      // the email field (docs §3.2).
      const fieldErrors = mapBackendErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        formRef.value?.setErrors(fieldErrors)
      } else {
        formRef.value?.setFieldError('email', resolveErrorMessage(error as AxiosError))
      }
    } finally {
      loading.value = false
    }
  }

  async function submitRegister(values: GenericObject): Promise<void> {
    loading.value = true
    try {
      const form: RegisterForm = {
        organizationName: values.organizationName as string,
        centerName: values.centerName as string,
        firstName: values.firstName as string,
        lastName: values.lastName as string,
        phone: values.phone as string,
        password: values.password as string,
        email: values.email as string,
        login: values.email as string,
      }
      await registerApi(form)
      notify.success(t('auth.registered'))
      await router.replace('/login')
    } catch (error) {
      formRef.value?.setBackendErrors(error)
    } finally {
      loading.value = false
    }
  }

  return { loading, formRef, loginSchema, registerSchema, submitLogin, submitRegister }
}
