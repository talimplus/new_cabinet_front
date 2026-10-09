import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiDropdown from '../UiDropdown.vue'

// The panel is teleported to <body> (a table's overflow box clipped it), so
// assertions query the real document instead of the wrapper.
const menu = () => document.body.querySelector<HTMLElement>('[role="menu"]')

let wrapper: VueWrapper | null = null
function mountDropdown(options: Parameters<typeof mount>[1] = {}) {
  wrapper = mount(UiDropdown, { attachTo: document.body, ...options })
  return wrapper
}
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

function stubRects(trigger: Partial<DOMRect>, panel: Partial<DOMRect>) {
  const original = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const rect = this.getAttribute('role') === 'menu' ? panel : trigger
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}), ...rect } as DOMRect
  }
  return () => {
    Element.prototype.getBoundingClientRect = original
  }
}

describe('UiDropdown', () => {
  it('renders the trigger slot', () => {
    const w = mountDropdown({ slots: { trigger: '<span>Open menu</span>', default: 'Menu item' } })
    expect(w.text()).toContain('Open menu')
  })

  it('is closed initially and opens in <body> on trigger click', async () => {
    const w = mountDropdown({ slots: { trigger: '<span>Open</span>', default: '<span>Item</span>' } })
    expect(menu()).toBeNull()

    await w.get('span').trigger('click')
    expect(menu()?.textContent).toContain('Item')
    expect(w.element.contains(menu())).toBe(false)
  })

  it('closes on Escape', async () => {
    const w = mountDropdown({ slots: { trigger: '<span>Open</span>', default: '<span>Item</span>' } })
    await w.get('span').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(menu()).toBeNull()
  })

  it('closes on an outside click but not on a click inside the panel', async () => {
    const w = mountDropdown({
      props: { closeOnSelect: false },
      slots: { trigger: '<span>Open</span>', default: '<span class="inside">Item</span>' },
    })
    await w.get('span').trigger('click')
    menu()!.querySelector<HTMLElement>('.inside')!.click()
    await nextTick()
    expect(menu()).not.toBeNull()

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(menu()).toBeNull()
  })

  it('passes a close function to the default slot', async () => {
    const w = mountDropdown({
      props: { closeOnSelect: false },
      slots: {
        trigger: '<span>Open</span>',
        default: `<template #default="{ close }"><button class="closer" @click="close">Close</button></template>`,
      },
    })
    await w.get('span').trigger('click')
    menu()!.querySelector<HTMLElement>('.closer')!.click()
    await nextTick()
    expect(menu()).toBeNull()
  })

  it('opens above the trigger when the bottom of the viewport has no room', async () => {
    const restore = stubRects(
      { left: 20, right: 120, top: window.innerHeight - 40, bottom: window.innerHeight - 10 },
      { width: 180, height: 120 },
    )
    try {
      const w = mountDropdown({ slots: { trigger: '<button id="t">open</button>', default: '<div>menu</div>' } })
      await w.get('#t').trigger('click')
      await nextTick()
      expect(menu()!.style.top).toBe(`${window.innerHeight - 40 - 4 - 120}px`)
      expect(menu()!.style.left).toBe('20px')
    } finally {
      restore()
    }
  })
})
