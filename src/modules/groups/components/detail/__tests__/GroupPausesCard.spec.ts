import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import GroupPausesCard from '../GroupPausesCard.vue'
import { fetchGroupPauses as fetchGroupPausesApi } from '../../../api/group-pauses.api'
import { formatDate } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { GroupPause } from '../../../interfaces/group-pause.interface'

vi.mock('../../../api/group-pauses.api', () => ({
  fetchGroupPauses: vi.fn(),
  createGroupPause: vi.fn(),
  deleteGroupPause: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchGroupPausesApi)

function makePause(overrides: Partial<GroupPause> = {}): GroupPause {
  return {
    id: 3,
    groupId: 12,
    fromDate: '2026-10-01',
    toDate: '2026-10-10',
    reason: "Ustoz ta'tilda",
    createdAt: '2026-09-27T10:00:00Z',
    ...overrides,
  }
}

function mountCard(canEdit: boolean) {
  // UiModal / UiConfirmDialog teleport to <body> — assert on the real DOM.
  return mount(GroupPausesCard, { attachTo: document.body, props: { groupId: 12, canEdit } })
}

function findButton(label: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll('button')).find((b) =>
    b.textContent?.includes(label),
  )
}

describe('GroupPausesCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('loads on mount and renders the formatted range and reason', async () => {
    mockedFetch.mockResolvedValue([makePause()])
    const wrapper = mountCard(true)
    await flushPromises()

    expect(mockedFetch).toHaveBeenCalledWith(12)
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain(
      `${formatDate('2026-10-01')} – ${formatDate('2026-10-10')}`,
    )
    expect(items[0]!.text()).toContain("Ustoz ta'tilda")
    expect(wrapper.text()).not.toContain(t('groups.pauses.empty'))
  })

  it('shows the empty text when there are no pauses', async () => {
    mockedFetch.mockResolvedValue([])
    const wrapper = mountCard(true)
    await flushPromises()

    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.text()).toContain(t('groups.pauses.empty'))
  })

  it('hides the add and delete buttons when canEdit is false', async () => {
    mockedFetch.mockResolvedValue([makePause()])
    const wrapper = mountCard(false)
    await flushPromises()

    expect(findButton(t('groups.pauses.add'))).toBeUndefined()
    expect(wrapper.find(`[aria-label="${t('common.delete')}"]`).exists()).toBe(false)
  })

  it('shows the add and delete buttons when canEdit is true', async () => {
    mockedFetch.mockResolvedValue([makePause()])
    const wrapper = mountCard(true)
    await flushPromises()

    expect(findButton(t('groups.pauses.add'))).toBeDefined()
    expect(wrapper.find(`[aria-label="${t('common.delete')}"]`).exists()).toBe(true)
  })

  it('opens the pause modal when the add button is clicked', async () => {
    mockedFetch.mockResolvedValue([])
    mountCard(true)
    await flushPromises()
    expect(document.body.textContent).not.toContain(t('groups.pauses.addTitle'))

    findButton(t('groups.pauses.add'))!.click()
    await flushPromises()

    expect(document.body.textContent).toContain(t('groups.pauses.addTitle'))
  })
})
