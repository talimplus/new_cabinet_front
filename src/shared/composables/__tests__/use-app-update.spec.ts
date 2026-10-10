import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useAppUpdate, UPDATE_CHECK_INTERVAL_MS, UPDATE_SNOOZE_MS } from '../use-app-update'

const fetchMock = vi.fn()
const respond = (version: string, ok = true) =>
  fetchMock.mockResolvedValue({ ok, json: () => Promise.resolve({ version }) })

function setup(current = 'v1') {
  let api!: ReturnType<typeof useAppUpdate>
  const wrapper = mount(defineComponent({ setup: () => { api = useAppUpdate(current); return () => h('div') } }))
  return { api, wrapper }
}

describe('useAppUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('stays quiet while the deployed version matches', async () => {
    respond('v1')
    const { api } = setup()
    await api.check()
    expect(api.available.value).toBe(false)
    expect(fetchMock.mock.calls[0]![0]).toMatch(/version\.json\?t=\d+/)
    expect(fetchMock.mock.calls[0]![1]).toEqual({ cache: 'no-store' })
  })

  it('turns on once a different build is deployed, on the polling interval', async () => {
    respond('v2')
    const { api } = setup()
    await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(api.available.value).toBe(true)
  })

  it('ignores a missing file and a network error', async () => {
    respond('v2', false)
    const { api } = setup()
    await api.check()
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    await api.check()
    expect(api.available.value).toBe(false)
  })

  it('checks again when the tab becomes visible', async () => {
    respond('v2')
    const { api } = setup()
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.waitFor(() => expect(api.available.value).toBe(true))
  })

  it('"later" hides the prompt and snoozes checks for a while', async () => {
    respond('v2')
    const { api } = setup()
    await api.check()
    api.later()
    expect(api.available.value).toBe(false)
    await api.check()
    expect(api.available.value).toBe(false)
    vi.advanceTimersByTime(UPDATE_SNOOZE_MS)
    await api.check()
    expect(api.available.value).toBe(true)
  })

  it('stops polling on unmount', async () => {
    respond('v2')
    const { wrapper } = setup()
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS * 3)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
