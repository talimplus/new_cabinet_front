import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CenterAttendanceFields from '../CenterAttendanceFields.vue'
import { t } from '@/locales'

function mountFields(over: Record<string, unknown> = {}) {
  return mount(CenterAttendanceFields, {
    props: {
      latitude: '' as number | '',
      longitude: '' as number | '',
      checkInRadiusMeters: 150 as number | '',
      publicIp: '',
      geoLoading: false,
      ipLoading: false,
      ...over,
    },
  })
}

const btn = (w: ReturnType<typeof mountFields>, label: string) =>
  w.findAll('button').find((b) => b.text().includes(label))!

describe('CenterAttendanceFields', () => {
  it('renders the section title and all four fields', () => {
    const wrapper = mountFields()
    expect(wrapper.text()).toContain(t('centers.attendance.title'))
    expect(wrapper.findAll('input')).toHaveLength(4)
  })

  it('emits useLocation when the "my location" button is clicked', async () => {
    const wrapper = mountFields()
    await btn(wrapper, t('centers.attendance.useMyLocation')).trigger('click')
    expect(wrapper.emitted('useLocation')).toHaveLength(1)
  })

  it('emits captureIp when the capture-IP button is clicked', async () => {
    const wrapper = mountFields()
    await btn(wrapper, t('centers.attendance.captureIp')).trigger('click')
    expect(wrapper.emitted('captureIp')).toHaveLength(1)
  })

  it('emits update:latitude as a number when the latitude field changes', async () => {
    const wrapper = mountFields()
    await wrapper.findAll('input[type=number]')[0]!.setValue('41.31')
    const events = wrapper.emitted('update:latitude') ?? []
    expect(events[events.length - 1]).toEqual([41.31])
  })

  it('emits an empty string when a coordinate is cleared (never 0)', async () => {
    const wrapper = mountFields({ latitude: 41.31 })
    await wrapper.findAll('input[type=number]')[0]!.setValue('')
    const events = wrapper.emitted('update:latitude') ?? []
    expect(events[events.length - 1]).toEqual([''])
  })
})
