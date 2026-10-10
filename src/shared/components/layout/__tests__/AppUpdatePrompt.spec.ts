import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import AppUpdatePrompt from '../AppUpdatePrompt.vue'
import { t } from '@/locales'

const available = ref(false)
const later = vi.fn(() => { available.value = false })
const reload = vi.fn()
vi.mock('@/shared/composables/use-app-update', () => ({
  useAppUpdate: () => ({ available, later, reload, check: vi.fn() }),
}))

const mountPrompt = () => mount(AppUpdatePrompt, { global: { stubs: { teleport: true } } })

describe('AppUpdatePrompt', () => {
  beforeEach(() => {
    available.value = false
    later.mockClear()
    reload.mockClear()
  })

  it('renders nothing until a new version is available', async () => {
    const wrapper = mountPrompt()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    available.value = true
    await nextTick()
    expect(wrapper.get('[role="status"]').text()).toContain(t('common.update.title'))
    expect(wrapper.get('[role="status"]').classes()).toEqual(expect.arrayContaining(['right-4', 'bottom-4']))
  })

  it('reloads the page and snoozes from its buttons', async () => {
    available.value = true
    const wrapper = mountPrompt()
    const [reloadBtn, laterBtn] = wrapper.findAll('button')
    expect(reloadBtn!.text()).toContain(t('common.update.reload'))
    await reloadBtn!.trigger('click')
    expect(reload).toHaveBeenCalled()
    await laterBtn!.trigger('click')
    expect(later).toHaveBeenCalled()
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })
})
