import { computed, ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { t } from '@/locales'
import { UserRole } from '@/shared/enums/user-role.enum'
import { useNotificationStore } from '@/stores/notification.store'
import { fetchMyProfile, updateMyProfile } from '../api/profile.api'
import type { Profile, ProfileForm } from '../interfaces/profile.interface'

/**
 * Own-profile page state: load `/users/me`, edit the four editable fields plus an
 * optional new password, and PUT the change. The password is only sent when the
 * user typed one. `salary` / `commissionPercentage` are read-only teacher info.
 */
export function useProfile() {
  const notify = useNotificationStore()
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  const isTeacher = computed(() => profile.value?.role === UserRole.TEACHER)

  const initialValues = computed(() => ({
    firstName: profile.value?.firstName ?? '',
    lastName: profile.value?.lastName ?? '',
    login: profile.value?.login ?? '',
    phone: profile.value?.phone ?? '',
    password: '',
  }))

  const schema = computed(() =>
    toTypedSchema(
      z.object({
        firstName: z.string().min(1, t('profile.validation.firstName')),
        lastName: z.string().min(1, t('profile.validation.lastName')),
        login: z.string().min(1, t('profile.validation.login')),
        phone: z.string().min(1, t('profile.validation.phone')),
        password: z.string().optional(),
      }),
    ),
  )

  /** True once any editable field differs from the loaded profile. */
  function isDirty(values: GenericObject): boolean {
    const init = initialValues.value
    return (
      values.firstName !== init.firstName ||
      values.lastName !== init.lastName ||
      values.login !== init.login ||
      values.phone !== init.phone ||
      Boolean((values.password as string)?.length)
    )
  }

  function buildPayload(values: GenericObject): ProfileForm {
    const payload: ProfileForm = {
      firstName: (values.firstName as string).trim(),
      lastName: (values.lastName as string).trim(),
      login: (values.login as string).trim(),
      phone: (values.phone as string).trim(),
    }
    const password = (values.password as string)?.trim()
    if (password) payload.password = password
    return payload
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      profile.value = await fetchMyProfile()
    } finally {
      loading.value = false
    }
  }

  async function submit(values: GenericObject): Promise<void> {
    saving.value = true
    try {
      profile.value = await updateMyProfile(buildPayload(values))
      notify.success(t('profile.updateSuccess'))
    } finally {
      saving.value = false
    }
  }

  return { profile, loading, saving, isTeacher, initialValues, schema, isDirty, buildPayload, load, submit }
}
