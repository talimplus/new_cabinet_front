import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import PagePlaceholder from '../PagePlaceholder.vue'

function routerWith(meta: Record<string, unknown>) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: PagePlaceholder, meta }],
  })
}

describe('PagePlaceholder', () => {
  it("translates the current route's meta.titleKey", async () => {
    const router = routerWith({ titleKey: 'layout.menu.expenses' })
    router.push('/')
    await router.isReady()

    const wrapper = mount(PagePlaceholder, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Chiqimlar')
  })

  it('falls back to a default title when meta.titleKey is absent', async () => {
    const router = routerWith({})
    router.push('/')
    await router.isReady()

    const wrapper = mount(PagePlaceholder, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Sahifa')
  })
})
