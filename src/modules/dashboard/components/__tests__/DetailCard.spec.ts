import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailCard from '../DetailCard.vue'

describe('DetailCard', () => {
  it('renders the title', () => {
    const wrapper = mount(DetailCard, {
      props: { title: 'To‘lovlar', rows: [] },
    })
    expect(wrapper.text()).toContain('To‘lovlar')
  })

  it('renders each row label and value', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'To‘lovlar',
        rows: [
          { label: 'To‘langan', value: '100 so‘m' },
          { label: 'Qolgan', value: '50 so‘m' },
        ],
      },
    })
    const text = wrapper.text()
    expect(text).toContain('To‘langan')
    expect(text).toContain('100 so‘m')
    expect(text).toContain('Qolgan')
    expect(text).toContain('50 so‘m')
  })

  it('renders a progress bar with a width style when percent is set', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'X',
        rows: [{ label: 'To‘langan', value: '1', percent: 40 }],
      },
    })
    const bar = wrapper.find('.bg-primary')
    expect(bar.exists()).toBe(true)
    expect(bar.attributes('style')).toContain('width: 40%')
  })

  it('clamps the progress bar width to the 0–100 range', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'X',
        rows: [
          { label: 'Over', value: '1', percent: 250 },
          { label: 'Under', value: '2', percent: -30 },
        ],
      },
    })
    const bars = wrapper.findAll('.bg-primary')
    expect(bars[0]?.attributes('style')).toContain('width: 100%')
    expect(bars[1]?.attributes('style')).toContain('width: 0%')
  })

  it('renders no progress bar when percent is not set', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'X',
        rows: [{ label: 'Soni', value: '5' }],
      },
    })
    expect(wrapper.find('.bg-primary').exists()).toBe(false)
  })

  it('applies the danger tone class to a danger row value', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'X',
        rows: [{ label: 'Qolgan', value: '50', tone: 'danger' }],
      },
    })
    expect(wrapper.html()).toContain('text-danger')
  })

  it('applies the success tone class to a success row value', () => {
    const wrapper = mount(DetailCard, {
      props: {
        title: 'X',
        rows: [{ label: 'To‘langan', value: '50', tone: 'success' }],
      },
    })
    expect(wrapper.html()).toContain('text-success')
  })
})
