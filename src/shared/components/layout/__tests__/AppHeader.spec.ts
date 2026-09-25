import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h } from 'vue'
import AppHeader from '../AppHeader.vue'
import { useUserStore } from '@/stores/user.store'
import { UserRole, USER_ROLE_LABEL_KEYS } from '@/shared/enums/user-role.enum'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { t } from '@/locales'

const AppCenterSwitcherStub = {
  name: 'AppCenterSwitcher',
  template: '<div data-test="center-switcher" />',
}

const routes = [
  { path: '/', name: 'home', component: { render: () => h('div') }, meta: { titleKey: 'layout.menu.students' } },
  { path: '/login', name: 'login', component: { render: () => h('div') } },
]
const router = createRouter({ history: createMemoryHistory(), routes })

function signIn(overrides: Partial<{ roleName: string | null; role: UserRole }> = {}) {
  useUserStore().user = {
    id: 1,
    email: 'kassir@talimplus.uz',
    role: overrides.role ?? UserRole.TEACHER,
    roleId: 1,
    roleName: overrides.roleName ?? null,
    centerId: 2,
    permissions: [ALL_PERMISSIONS],
  }
}

async function mountHeader() {
  const wrapper = mount(AppHeader, {
    global: {
      plugins: [router],
      stubs: { AppCenterSwitcher: AppCenterSwitcherStub },
    },
  })
  await router.isReady()
  return wrapper
}

async function openDropdown(wrapper: Awaited<ReturnType<typeof mountHeader>>) {
  const trigger = wrapper.findAll('button').find((btn) => btn.text().includes('kassir@talimplus.uz'))
  await trigger!.trigger('click')
}

describe('AppHeader', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/')
    await router.isReady()
  })

  it("shows the user's email and a custom roleName when set", async () => {
    signIn({ roleName: 'Kassir' })
    const wrapper = await mountHeader()

    expect(wrapper.text()).toContain('kassir@talimplus.uz')
    expect(wrapper.text()).toContain('Kassir')
  })

  it('falls back to the base role label when roleName is null', async () => {
    signIn({ roleName: null, role: UserRole.TEACHER })
    const wrapper = await mountHeader()

    expect(wrapper.text()).toContain(t(USER_ROLE_LABEL_KEYS[UserRole.TEACHER]))
  })

  it('shows the role label both in the trigger and the phone-only dropdown block', async () => {
    signIn({ roleName: 'Kassir' })
    const wrapper = await mountHeader()

    // Trigger (sm+ block) already renders the role before opening the dropdown.
    const triggerRoleNodes = wrapper.findAll('span').filter((n) => n.text() === 'Kassir')
    expect(triggerRoleNodes.length).toBeGreaterThan(0)

    await openDropdown(wrapper)

    // The phone-only block sits atop the dropdown panel once it's open.
    const roleOccurrences = wrapper.findAll('p, span').filter((n) => n.text() === 'Kassir')
    expect(roleOccurrences.length).toBeGreaterThanOrEqual(2)
  })

  it('logs out and navigates to /login when the logout item is clicked', async () => {
    signIn({ roleName: 'Kassir' })
    const wrapper = await mountHeader()
    const userStore = useUserStore()
    const logoutSpy = vi.spyOn(userStore, 'logout').mockResolvedValue(undefined)
    const replaceSpy = vi.spyOn(router, 'replace')

    await openDropdown(wrapper)
    const logoutItem = wrapper.findAll('[role="menuitem"]').find((n) => n.text().includes(t('layout.logout')))
    expect(logoutItem).toBeTruthy()
    await logoutItem!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(logoutSpy).toHaveBeenCalled()
    expect(replaceSpy).toHaveBeenCalledWith('/login')
  })
})
