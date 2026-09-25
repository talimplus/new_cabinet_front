import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AppCenterSwitcher from '../AppCenterSwitcher.vue'
import { useScopeStore } from '@/stores/scope.store'
import { useUserStore } from '@/stores/user.store'
import { UserRole } from '@/shared/enums/user-role.enum'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { t } from '@/locales'
import type { Center } from '@/modules/centers/interfaces/center.interface'

vi.mock('@/modules/centers/api/centers.api', () => ({
  fetchAllCenters: vi.fn<() => Promise<never[]>>(),
}))
import type * as AuthApiModule from '@/modules/auth/api/auth.api'

type AuthApi = typeof AuthApiModule

vi.mock('@/modules/auth/api/auth.api', () => ({
  login: vi.fn<AuthApi['login']>(),
  logout: vi.fn<AuthApi['logout']>(),
  register: vi.fn<AuthApi['register']>(),
  fetchMe: vi.fn<AuthApi['fetchMe']>(),
}))

// Stub the multiselect wrapper so the options are inspectable as plain data.
const UiSelectStub = {
  name: 'UiSelect',
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template: '<div data-test="switcher" />',
}

const CENTERS: Center[] = [
  { id: 1, name: 'Markaz 1', isDefault: true },
  { id: 2, name: 'Markaz 2' },
]

function signIn(role: UserRole, centerId: number | null = 2): void {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role, roleId: 1, roleName: 'Test',
    centerId, permissions: [ALL_PERMISSIONS],
  }
}

function mountSwitcher() {
  return mount(AppCenterSwitcher, { global: { stubs: { UiSelect: UiSelectStub } } })
}

describe('AppCenterSwitcher', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('offers the picker to an owner with more than one center', () => {
    signIn(UserRole.ADMIN)
    useScopeStore().centers = CENTERS

    expect(mountSwitcher().find('[data-test="switcher"]').exists()).toBe(true)
  })

  it('lists "All centers" first, then every center', () => {
    signIn(UserRole.ADMIN)
    useScopeStore().centers = CENTERS

    const select = mountSwitcher().findComponent(UiSelectStub)
    expect(select.props('options')).toEqual([
      { label: t('layout.allCenters'), value: 'all' },
      { label: 'Markaz 1', value: 1 },
      { label: 'Markaz 2', value: 2 },
    ])
  })

  it('shows "All centers" as the selection when none is active', () => {
    signIn(UserRole.ADMIN)
    useScopeStore().centers = CENTERS

    expect(mountSwitcher().findComponent(UiSelectStub).props('modelValue')).toBe('all')
  })

  it('writes the picked center into the scope store', async () => {
    signIn(UserRole.ADMIN)
    const scope = useScopeStore()
    scope.centers = CENTERS

    const wrapper = mountSwitcher()
    await wrapper.findComponent(UiSelectStub).vm.$emit('update:modelValue', 2)
    expect(scope.activeCenterId).toBe(2)

    await wrapper.findComponent(UiSelectStub).vm.$emit('update:modelValue', 'all')
    expect(scope.activeCenterId).toBeNull()
  })

  it('hides the picker when the org has a single center', () => {
    signIn(UserRole.ADMIN)
    useScopeStore().centers = [CENTERS[0]!]

    expect(mountSwitcher().find('[data-test="switcher"]').exists()).toBe(false)
  })

  it('shows a non-switcher their own center instead of a picker', () => {
    signIn(UserRole.RECEPTION, 2)
    useScopeStore().centers = CENTERS

    const wrapper = mountSwitcher()
    expect(wrapper.find('[data-test="switcher"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Markaz 2')
  })
})
