import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h } from 'vue'
import StaffPerformanceView from '../StaffPerformanceView.vue'
import { t } from '@/locales'

// Stub the heavy child so this spec never touches the network — it only
// asserts what the view passes down and how it reacts to the route.
vi.mock('../../components/StaffOverviewCard.vue', () => ({
  default: {
    name: 'StaffOverviewCard',
    props: ['userId', 'showActions'],
    template: '<div class="staff-overview-stub" />',
  },
}))

const routes = [
  { path: '/my-performance', component: StaffPerformanceView },
  { path: '/users/:id', component: StaffPerformanceView },
]

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes })
}

async function mountAt(path: string) {
  const router = makeRouter()
  router.push(path)
  await router.isReady()
  const wrapper = mount(StaffPerformanceView, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('StaffPerformanceView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes the numeric id and enables actions on /users/:id', async () => {
    const { wrapper } = await mountAt('/users/49')

    const card = wrapper.findComponent({ name: 'StaffOverviewCard' })
    expect(card.exists()).toBe(true)
    expect(card.props('userId')).toBe(49)
    expect(card.props('showActions')).toBe(true)
  })

  it('renders the back button and heading on /users/:id', async () => {
    const { wrapper } = await mountAt('/users/49')

    expect(wrapper.text()).toContain(t('staff.title'))
    // UiIconButton renders as a real button in this app's kit.
    const backButton = wrapper.find('button[aria-label="' + t('common.back') + '"]')
    expect(backButton.exists()).toBe(true)
  })

  it('calls router.back() when the back button is clicked', async () => {
    const { wrapper, router } = await mountAt('/users/49')
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => {})

    const backButton = wrapper.find('button[aria-label="' + t('common.back') + '"]')
    await backButton.trigger('click')

    expect(backSpy).toHaveBeenCalledTimes(1)
  })

  it('passes userId=null and disables actions on /my-performance', async () => {
    const { wrapper } = await mountAt('/my-performance')

    const card = wrapper.findComponent({ name: 'StaffOverviewCard' })
    expect(card.exists()).toBe(true)
    expect(card.props('userId')).toBe(null)
    expect(card.props('showActions')).toBe(false)
  })

  it('renders no back button or heading on /my-performance', async () => {
    const { wrapper } = await mountAt('/my-performance')

    expect(wrapper.text()).not.toContain(t('staff.title'))
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
