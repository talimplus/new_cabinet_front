import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiStatCard from '../UiStatCard.vue'
import { Users } from '@/shared/icons'

describe('UiStatCard', () => {
  it('renders the label and value', () => {
    const wrapper = mount(UiStatCard, {
      props: { label: 'O‘quvchilar', value: '128', icon: Users },
    })
    expect(wrapper.text()).toContain('O‘quvchilar')
    expect(wrapper.text()).toContain('128')
  })

  it('renders the passed icon as an svg', () => {
    const wrapper = mount(UiStatCard, {
      props: { label: 'Balans', value: '1 000', icon: Users },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('applies the tone classes to the icon box', () => {
    const wrapper = mount(UiStatCard, {
      props: { label: 'Faol', value: '4', icon: Users, tone: 'success' },
    })
    expect(wrapper.html()).toContain('bg-success-soft')
  })

  it('renders the hint line only when given', () => {
    const without = mount(UiStatCard, { props: { label: 'Faol', value: '4', icon: Users } })
    expect(without.findAll('p')).toHaveLength(1)

    const withHint = mount(UiStatCard, {
      props: { label: 'Faol', value: '4', icon: Users, hint: '3 ta' },
    })
    expect(withHint.text()).toContain('3 ta')
  })

  it('tints the figure itself only when colored', () => {
    const plain = mount(UiStatCard, {
      props: { label: 'Faol', value: '4', icon: Users, tone: 'success' },
    })
    expect(plain.findAll('p')[0]!.classes().join(' ')).toContain('text-foreground')

    const colored = mount(UiStatCard, {
      props: { label: 'Faol', value: '4', icon: Users, tone: 'success', colored: true },
    })
    expect(colored.findAll('p')[0]!.classes().join(' ')).toContain('text-success')
  })
})
