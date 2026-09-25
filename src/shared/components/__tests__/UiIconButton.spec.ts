import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiIconButton from '../UiIconButton.vue'
import { Pencil } from '@/shared/icons'

function mountButton(props: Record<string, unknown> = {}) {
  return mount(UiIconButton, { props: { icon: Pencil, ...props } })
}

describe('UiIconButton', () => {
  it('renders the given icon', () => {
    expect(mountButton().find('svg').exists()).toBe(true)
  })

  it('is a 44px touch target on phones and compact from md up', () => {
    const classes = mountButton().get('button').classes().join(' ')
    expect(classes).toContain('h-11')
    expect(classes).toContain('w-11')
    expect(classes).toContain('md:h-8')
    expect(classes).toContain('md:w-8')
  })

  it('exposes the label as the accessible name and the tooltip', () => {
    const button = mountButton({ label: 'Tahrirlash' }).get('button')
    expect(button.attributes('aria-label')).toBe('Tahrirlash')
    expect(button.attributes('title')).toBe('Tahrirlash')
  })

  it('defaults to type="button" so it never submits a form', () => {
    expect(mountButton().get('button').attributes('type')).toBe('button')
  })

  it('applies the tone token classes', () => {
    expect(mountButton({ tone: 'danger' }).get('button').classes().join(' ')).toContain('hover:text-danger')
    expect(mountButton({ tone: 'success' }).get('button').classes().join(' ')).toContain('hover:text-success')
    expect(mountButton().get('button').classes().join(' ')).toContain('hover:text-foreground')
  })

  it('does not emit a click while disabled', async () => {
    const wrapper = mountButton({ disabled: true })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('emits a click when enabled', async () => {
    const wrapper = mountButton()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
