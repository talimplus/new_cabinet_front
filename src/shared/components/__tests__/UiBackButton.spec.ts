import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h } from 'vue'
import UiBackButton from '../UiBackButton.vue'
import { t } from '@/locales'

const page = { render: () => h('div') }

async function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: page },
      { path: '/groups', name: 'groups', component: page },
      { path: '/groups/:id', component: page },
    ],
  })
  await router.push('/groups/5')
  const back = vi.spyOn(router, 'back').mockImplementation(() => undefined)
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(UiBackButton, {
    props: { fallback: { name: 'groups' } },
    global: { plugins: [router] },
  })
  return { wrapper, back, push }
}

describe('UiBackButton', () => {
  afterEach(() => window.history.replaceState(null, ''))

  it('has the default accessible label', async () => {
    const { wrapper } = await setup()
    expect(wrapper.get('button').attributes('aria-label')).toBe(t('common.back'))
  })

  it('goes back when the user came from another page of the app', async () => {
    window.history.replaceState({ back: '/students' }, '')
    const { wrapper, back, push } = await setup()
    await wrapper.get('button').trigger('click')
    expect(back).toHaveBeenCalledOnce()
    expect(push).not.toHaveBeenCalled()
  })

  it('opens the fallback when the page was opened directly', async () => {
    window.history.replaceState(null, '')
    const { wrapper, back, push } = await setup()
    await wrapper.get('button').trigger('click')
    expect(back).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: 'groups' })
  })
})
