import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiLocaleToggle from '../UiLocaleToggle.vue'
import { i18n, setLocale, LOCALE_STORAGE_KEY } from '@/locales'
import { AppLocale } from '@/shared/enums/app-locale.enum'

async function openMenu() {
  const wrapper = mount(UiLocaleToggle)
  await wrapper.get('button').trigger('click')
  return wrapper
}

describe('UiLocaleToggle', () => {
  beforeEach(() => {
    setLocale(AppLocale.UZ)
  })
  afterEach(() => {
    setLocale(AppLocale.UZ)
    localStorage.removeItem(LOCALE_STORAGE_KEY)
  })

  it('shows the active locale code on the trigger', () => {
    const wrapper = mount(UiLocaleToggle)
    expect(wrapper.get('button').text()).toContain('uz')
  })

  it('lists both languages once opened', async () => {
    const items = (await openMenu()).findAll('[role="menuitem"]')
    expect(items).toHaveLength(2)
    expect(items[0]!.text()).toContain("O'zbekcha")
    expect(items[1]!.text()).toContain('Русский')
  })

  it('switches the app locale when a language is picked', async () => {
    const wrapper = await openMenu()
    await wrapper.findAll('[role="menuitem"]')[1]!.trigger('click')

    expect(i18n.global.locale.value).toBe(AppLocale.RU)
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(AppLocale.RU)
    expect(document.documentElement.getAttribute('lang')).toBe(AppLocale.RU)
  })

  it('renders the menu in the newly selected language', async () => {
    setLocale(AppLocale.RU)
    const wrapper = await openMenu()
    expect(wrapper.get('button').text()).toContain('ru')
    expect(wrapper.text()).toContain('Русский')
  })
})
