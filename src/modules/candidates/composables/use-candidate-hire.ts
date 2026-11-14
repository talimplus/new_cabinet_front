import { computed, reactive, ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { changeCandidateStatus, hireCandidate } from '../api/candidates.api'
import { fetchRoles } from '@/modules/roles/api/roles.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { Permission } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { useUserStore } from '@/stores/user.store'
import { useNotificationStore } from '@/stores/notification.store'
import { CandidateStatus } from '../enums/candidate-status.enum'
import { CANDIDATE_POSITION_BASE_ROLE } from '../enums/candidate-position.enum'
import type { Candidate } from '../interfaces/candidate.interface'
import type { CandidateHireForm } from '../interfaces/candidate-form.interface'
import type { Role } from '@/modules/roles/interfaces/role.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

const toNum = (v: unknown): number | undefined =>
  v === '' || v === null || v === undefined ? undefined : Number(v)

/**
 * Candidate status changes + "ishga kirdi → xodimlarga o'tkazish". Picking
 * "hired" asks whether to transfer the person to staff; "yes" opens the
 * employee form pre-filled from the candidate (login, password and role are
 * never on a candidate, so the form always asks for them), "no" only sets the
 * status. `onChanged` receives the updated candidate.
 */
export function useCandidateHire(onChanged: (c: Candidate) => Promise<void> | void) {
  const userStore = useUserStore()
  const notify = useNotificationStore()
  const canHire = computed(() => userStore.can(Permission.USERS_CREATE))

  const state = reactive({
    askTarget: null as Candidate | null,
    hireTarget: null as Candidate | null,
    changingId: null as number | null,
    saving: false,
  })

  async function apply(c: Candidate, status: CandidateStatus): Promise<void> {
    state.changingId = c.id
    try {
      const updated = await changeCandidateStatus(c.id, { status })
      notify.success(t('candidates.statusChanged'))
      await onChanged(updated)
    } finally {
      state.changingId = null
    }
  }

  async function changeStatus(c: Candidate, status: CandidateStatus): Promise<void> {
    if (status === CandidateStatus.HIRED && !c.hiredUserId && canHire.value) {
      state.askTarget = c
      return
    }
    await apply(c, status)
  }

  /** "No" — only the status, the person is not added to staff. */
  async function askNo(): Promise<void> {
    const c = state.askTarget
    state.askTarget = null
    if (c && c.status !== CandidateStatus.HIRED) await apply(c, CandidateStatus.HIRED)
  }
  function askYes(): void {
    const c = state.askTarget
    state.askTarget = null
    if (c) openHire(c)
  }

  const roles = ref<Role[]>([])
  async function openHire(c: Candidate): Promise<void> {
    state.hireTarget = c
    if (!roles.value.length) {
      const list = await optionalRequest(fetchRoles(), [])
      roles.value = list.filter((r) => r.baseRole !== UserRole.ADMIN && r.baseRole !== UserRole.STUDENT)
    }
  }
  const roleOptions = computed<SelectOption[]>(() => roles.value.map((r) => ({ label: r.name, value: r.id })))

  const schema = computed(() =>
    toTypedSchema(
      z.object({
        firstName: z.string().trim().min(1, t('users.validation.firstName')),
        lastName: z.string().trim().min(1, t('users.validation.lastName')),
        phone: z.string().min(1, t('users.validation.phone')),
        // Sign-in validates the login as an e-mail — any other login could never log in.
        login: z.string().trim().min(1, t('users.validation.login')).email(t('candidates.hire.loginEmail')),
        password: z.string().min(6, t('candidates.hire.passwordMin')),
        roleId: z.number({ message: t('users.validation.role') }),
        salary: z.union([z.number(), z.literal('')]).optional(),
        commissionPercentage: z.union([z.number(), z.literal('')]).optional(),
      }),
    ),
  )

  /** Pre-filled from the candidate; the role matching their position is pre-picked. */
  const initialValues = computed(() => {
    const c = state.hireTarget
    const base = c ? CANDIDATE_POSITION_BASE_ROLE[c.position] : null
    const role = roles.value.find((r) => r.isSystem && r.baseRole === base) ?? roles.value.find((r) => r.baseRole === base)
    return {
      firstName: c?.firstName ?? '',
      lastName: c?.lastName ?? '',
      phone: c?.phone ?? '',
      login: '',
      password: '',
      roleId: role?.id,
      salary: '',
      commissionPercentage: '',
    }
  })

  /** Throws on a failed request so the modal can map 422 errors onto its fields. */
  async function submitHire(values: GenericObject): Promise<void> {
    const c = state.hireTarget
    if (!c || state.saving) return
    const form: CandidateHireForm = {
      firstName: String(values.firstName).trim(),
      lastName: String(values.lastName).trim(),
      phone: values.phone as string,
      login: String(values.login).trim(),
      password: values.password as string,
      roleId: values.roleId as number,
    }
    if (toNum(values.salary) !== undefined) form.salary = toNum(values.salary)
    if (toNum(values.commissionPercentage) !== undefined) form.commissionPercentage = toNum(values.commissionPercentage)
    state.saving = true
    try {
      const updated = await hireCandidate(c.id, form)
      notify.success(t('candidates.hire.done', { name: `${form.lastName} ${form.firstName}` }))
      state.hireTarget = null
      await onChanged(updated)
    } finally {
      state.saving = false
    }
  }

  return { state, canHire, changeStatus, askNo, askYes, openHire, roleOptions, schema, initialValues, submitHire }
}
