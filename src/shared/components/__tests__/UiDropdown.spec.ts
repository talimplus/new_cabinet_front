import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiDropdown from '../UiDropdown.vue'

describe('UiDropdown', () => {
  it('renders the trigger slot', () => {
    const wrapper = mount(UiDropdown, {
      slots: { trigger: '<span>Open menu</span>', default: 'Menu item' },
    })
    expect(wrapper.text()).toContain('Open menu')
  })

  it('is closed initially and opens on trigger click', async () => {
    const wrapper = mount(UiDropdown, {
      slots: { trigger: '<span>Open</span>', default: '<span>Item</span>' },
    })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.get('span').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Item')
  })

  it('closes on Escape', async () => {
    const wrapper = mount(UiDropdown, {
      slots: { trigger: '<span>Open</span>', default: '<span>Item</span>' },
    })
    await wrapper.get('span').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('closes on an outside click', async () => {
    const wrapper = mount(UiDropdown, {
      attachTo: document.body,
      slots: { trigger: '<span>Open</span>', default: '<span>Item</span>' },
    })
    await wrapper.get('span').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('passes a close function to the default slot', async () => {
    const wrapper = mount(UiDropdown, {
      props: { closeOnSelect: false },
      slots: {
        trigger: '<span>Open</span>',
        default: `<template #default="{ close }"><button class="closer" @click="close">Close</button></template>`,
      },
    })
    await wrapper.get('span').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    await wrapper.get('button.closer').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('flips a left-aligned panel inward when it would leave the viewport', async () => {
    const wrapper = mount(UiDropdown, {
      slots: { trigger: '<button id="t">open</button>', default: '<div>menu</div>' },
      attachTo: document.body,
    })

    // jsdom reports zero-size rects, so force an overflowing measurement.
    const original = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      return { right: window.innerWidth + 50, left: 0, top: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
    }
    try {
      await wrapper.get('#t').trigger('click')
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(wrapper.get('[role="menu"]').classes()).toContain('right-0')
    } finally {
      Element.prototype.getBoundingClientRect = original
      wrapper.unmount()
    }
  })

  it('keeps a panel that fits on its configured side', async () => {
    const wrapper = mount(UiDropdown, {
      slots: { trigger: '<button id="t">open</button>', default: '<div>menu</div>' },
    })
    await wrapper.get('#t').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[role="menu"]').classes()).toContain('left-0')
  })
})
