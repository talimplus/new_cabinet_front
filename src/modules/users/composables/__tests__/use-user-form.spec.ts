import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { useUserForm } from '../use-user-form'
import { fetchRoles as fetchRolesApi } from '@/modules/roles/api/roles.api'
import { useUserStore } from '@/stores/user.store'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { UiForm, UiSelect } from '@/shared/components'
import { t } from '@/locales'
import type { Role } from '@/modules/roles/interfaces/role.interface'
import type { User } from '../../interfaces/user.interface'

vi.mock('@/modules/roles/api/roles.api', () => ({
  fetchRoles: vi.fn(),
}))

const mockedFetchRoles = vi.mocked(fetchRolesApi)

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 1, key: 'admin', name: 'Administrator', baseRole: UserRole.ADMIN,
    permissions: ['*'], isSystem: true, isLocked: true, userCount: 1,
    createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z',
    ...overrides,
  }
}

const adminRole = makeRole()
const teacherRole = makeRole({ id: 2, key: 'teacher', name: 'Oʻqituvchi', baseRole: UserRole.TEACHER, isSystem: true, isLocked: false })
const kassirRole = makeRole({ id: 3, key: 'kassir', name: 'Kassir', baseRole: UserRole.OTHER, isSystem: false, isLocked: false })

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998901112233',
    role: UserRole.TEACHER, centerId: 2, salary: 2000000, commissionPercentage: 40,
    ...overrides,
  }
}

/** Authorization is key-based — seed a `'*'`-permission user so `optionalRequest`
 * (used by `loadRoles`) has a store to read from. */
function seedUserStore() {
  const userStore = useUserStore()
  userStore.user = {
    id: 1, email: 'admin@x.uz', role: UserRole.ADMIN, roleId: 1, roleName: 'Administrator',
    centerId: 1, permissions: [ALL_PERMISSIONS],
  }
}

describe('useUserForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    seedUserStore()
    vi.clearAllMocks()
  })

  describe('loadRoles() / roleOptions', () => {
    it('fetches roles and maps them to options, excluding the locked Administrator role', async () => {
      mockedFetchRoles.mockResolvedValueOnce([adminRole, teacherRole, kassirRole])
      const form = useUserForm(() => null, () => null)

      await form.loadRoles()

      expect(mockedFetchRoles).toHaveBeenCalled()
      expect(form.roleOptions.value).toEqual([
        { label: teacherRole.name, value: teacherRole.id },
        { label: kassirRole.name, value: kassirRole.id },
      ])
    })
  })

  describe('buildPayload()', () => {
    it('builds a UserForm with a numeric roleId and no role string', () => {
      const form = useUserForm(() => null, () => null)
      const payload = form.buildPayload({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998901112233',
        password: 'secret', roleId: 3, centerId: 2, salary: '', commissionPercentage: '',
      })

      expect(payload).toEqual({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998901112233',
        password: 'secret', roleId: 3, centerId: 2,
      })
      expect(payload).not.toHaveProperty('role')
      expect(typeof payload.roleId).toBe('number')
    })

    it('omits password when it is blank or whitespace-only', () => {
      const form = useUserForm(() => null, () => null)

      const blank = form.buildPayload({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
        password: '', roleId: 3, centerId: 2,
      })
      const whitespace = form.buildPayload({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
        password: '   ', roleId: 3, centerId: 2,
      })

      expect(blank).not.toHaveProperty('password')
      expect(whitespace).not.toHaveProperty('password')
    })

    it('trims and includes a non-blank password', () => {
      const form = useUserForm(() => null, () => null)
      const payload = form.buildPayload({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
        password: '  secret  ', roleId: 3, centerId: 2,
      })
      expect(payload.password).toBe('secret')
    })

    it('omits salary/commissionPercentage when blank and keeps them when numeric', () => {
      const form = useUserForm(() => null, () => null)

      const omitted = form.buildPayload({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
        roleId: 3, centerId: 2, salary: '', commissionPercentage: '',
      })
      expect(omitted).not.toHaveProperty('salary')
      expect(omitted).not.toHaveProperty('commissionPercentage')

      const kept = form.buildPayload({
        firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
        roleId: 3, centerId: 2, salary: 2000000, commissionPercentage: 40,
      })
      expect(kept.salary).toBe(2000000)
      expect(kept.commissionPercentage).toBe(40)
    })
  })

  describe('initialValues', () => {
    it('has roleId undefined for a new (non-editing) user', () => {
      const form = useUserForm(() => null, () => 5)
      expect(form.initialValues.value.roleId).toBeUndefined()
      expect(form.initialValues.value.centerId).toBe(5)
    })

    it('reads roleId from editing.userRole.id and centerId from editing.center.id', () => {
      const editing = makeUser({
        userRole: { id: 9, name: 'Kassir', baseRole: UserRole.OTHER },
        center: { id: 4, name: 'Chilonzor' },
      })
      const form = useUserForm(() => editing, () => null)

      expect(form.initialValues.value.roleId).toBe(9)
      expect(form.initialValues.value.centerId).toBe(4)
    })
  })

  describe('schema', () => {
    it('requires roleId — an empty select blocks submit with the role error message', async () => {
      const form = useUserForm(() => null, () => 5)
      mockedFetchRoles.mockResolvedValueOnce([teacherRole])
      await form.loadRoles()

      const formRef = ref()
      const submitted: Record<string, unknown>[] = []
      const Host = defineComponent({
        setup: (_, { expose }) => {
          expose({ formRef })
          return () =>
            h(
              UiForm,
              {
                ref: formRef,
                validationSchema: form.schema.value,
                initialValues: form.initialValues.value,
                onSubmit: (v: Record<string, unknown>) => submitted.push(v),
              },
              () => [h(UiSelect, { name: 'roleId', label: 'Rol', options: form.roleOptions.value })],
            )
        },
      })
      const wrapper = mount(Host)

      await formRef.value.submit()
      await flushPromises()

      expect(wrapper.text()).toContain(t('users.validation.role'))
      expect(submitted).toHaveLength(0)
    })
  })
})
