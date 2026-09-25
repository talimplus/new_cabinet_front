import { computed, ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { fetchRoles } from '@/modules/roles/api/roles.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Role } from '@/modules/roles/interfaces/role.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { User } from '../interfaces/user.interface'
import type { UserForm } from '../interfaces/user-form.interface'
import { t } from '@/locales'

const toNum = (v: unknown): number | undefined =>
  v === '' || v === null || v === undefined ? undefined : Number(v)

/**
 * The employee form: the assignable roles come from `GET /roles` (dynamic, so a
 * center's custom "Kassir" appears), and the payload sends `roleId`. The locked
 * Administrator role is never offered.
 */
export function useUserForm(editing: () => User | null, defaultCenterId: () => number | null) {
  const roles = ref<Role[]>([])

  async function loadRoles(): Promise<void> {
    const list = await optionalRequest(fetchRoles(), [])
    roles.value = list.filter((r) => r.baseRole !== UserRole.ADMIN)
  }
  const roleOptions = computed<SelectOption[]>(() =>
    roles.value.map((r) => ({ label: r.name, value: r.id })),
  )

  const num = z.union([z.number(), z.literal('')]).optional()
  const schema = computed(() =>
    toTypedSchema(
      z.object({
        firstName: z.string().min(1, t('users.validation.firstName')),
        lastName: z.string().min(1, t('users.validation.lastName')),
        login: z.string().min(1, t('users.validation.login')),
        phone: z.string().min(1, t('users.validation.phone')),
        password: editing() ? z.string().optional() : z.string().min(1, t('users.validation.password')),
        roleId: z.number({ message: t('users.validation.role') }),
        centerId: z.number({ message: t('common.centerRequired') }),
        salary: num,
        commissionPercentage: num,
      }),
    ),
  )

  const initialValues = computed(() => {
    const e = editing()
    return {
      firstName: e?.firstName ?? '',
      lastName: e?.lastName ?? '',
      login: e?.login ?? '',
      phone: e?.phone ?? '',
      password: '',
      roleId: e?.userRole?.id ?? undefined,
      centerId: e?.center?.id ?? e?.centerId ?? defaultCenterId() ?? undefined,
      salary: e?.salary ?? '',
      commissionPercentage: e?.commissionPercentage ?? '',
    }
  })

  function buildPayload(values: GenericObject): UserForm {
    const payload: UserForm = {
      firstName: values.firstName as string,
      lastName: values.lastName as string,
      login: values.login as string,
      phone: values.phone as string,
      roleId: values.roleId as number,
      centerId: values.centerId as number,
    }
    const password = (values.password as string)?.trim()
    if (password) payload.password = password
    if (toNum(values.salary) !== undefined) payload.salary = toNum(values.salary)
    if (toNum(values.commissionPercentage) !== undefined)
      payload.commissionPercentage = toNum(values.commissionPercentage)
    return payload
  }

  return { roleOptions, loadRoles, schema, initialValues, buildPayload }
}
