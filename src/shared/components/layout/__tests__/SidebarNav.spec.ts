import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { UserRole } from '@/shared/enums/user-role.enum'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h } from 'vue'
import SidebarNav from '../SidebarNav.vue'
import { navigation } from '@/shared/config/navigation'
import { t } from '@/locales'

// Minimal routes for every nav target so RouterLink can resolve `to`.
const routes = navigation
  .flatMap((group) => group.items)
  .map((item) => ({ path: item.to, component: { render: () => h('div') } }))
const router = createRouter({ history: createMemoryHistory(), routes })

function mountNav() {
  return mount(SidebarNav, { global: { plugins: [router] } })
}

describe('SidebarNav', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    // The sidebar is permission-driven; grant the wildcard so every item renders.
    // A manager (not admin) so `hideForBaseRoles` hides nothing here — /my-performance
    // is hidden only for admin/super_admin.
    useUserStore().user = {
      id: 1, email: 'a@b.uz', role: UserRole.MANAGER, roleId: 1,
      roleName: 'Manager', centerId: null, permissions: [ALL_PERMISSIONS],
    }
    router.push('/')
    await router.isReady()
  })

  it('renders every nav label from the navigation config', () => {
    const text = mountNav().text()
    for (const item of navigation.flatMap((g) => g.items)) {
      expect(text).toContain(t(item.labelKey))
    }
  })

  it('translates the group headings', () => {
    const text = mountNav().text()
    expect(text).toContain(t('layout.sections.payments'))
    expect(text).toContain(t('layout.sections.settings'))
  })

  it('renders the known labels and group headings', () => {
    const text = mountNav().text()
    expect(text).toContain('Statistika')
    expect(text).toContain('Guruhlar')
    expect(text).toContain('Markazlar')
    expect(text).toContain('Xonalar')
  })

  it('renders a link for each nav item', () => {
    const links = mountNav().findAll('a')
    expect(links.length).toBe(navigation.flatMap((g) => g.items).length)
  })
})
