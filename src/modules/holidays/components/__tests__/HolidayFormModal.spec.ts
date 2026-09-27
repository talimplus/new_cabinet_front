import { describe, it, expect, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import HolidayFormModal from '../HolidayFormModal.vue'
import { t } from '@/locales'
import type { HolidayFormState } from '../../composables/use-holidays'

const UiDatepickerStub = {
  name: 'UiDatepicker',
  props: ['modelValue', 'label', 'error'],
  emits: ['update:modelValue'],
  template: '<div class="dp-stub">{{ label }}<span class="dp-error">{{ error }}</span></div>',
}

function makeState(overrides: Partial<HolidayFormState> = {}): HolidayFormState {
  return reactive({
    open: true, fromDate: null, toDate: null, name: '', onlyActiveCenter: false, saving: false, errors: {},
    ...overrides,
  })
}

function mountModal(state: HolidayFormState, canScopeToCenter = false, activeCenterName = '') {
  // UiModal teleports its content to <body> — assert on the real DOM.
  return mount(HolidayFormModal, {
    attachTo: document.body,
    props: { state, canScopeToCenter, activeCenterName },
    global: { stubs: { UiDatepicker: UiDatepickerStub } },
  })
}

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === label,
  )
  if (!button) throw new Error(`button not found: ${label}`)
  return button
}

describe('HolidayFormModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when the state is closed', () => {
    mountModal(makeState({ open: false }))
    expect(document.body.textContent).not.toContain(t('holidays.addTitle'))
  })

  it('renders the title, name, both dates and the hint when open', () => {
    mountModal(makeState())
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('holidays.addTitle'))
    expect(text).toContain(t('holidays.form.name'))
    expect(text).toContain(t('holidays.form.fromDate'))
    expect(text).toContain(t('holidays.form.toDate'))
    expect(text).toContain(t('holidays.form.hint'))
  })

  it('shows the field errors from the state', () => {
    mountModal(makeState({ errors: { name: 'nom xato', toDate: 'sana xato' } }))
    const text = document.body.textContent ?? ''
    expect(text).toContain('nom xato')
    expect(text).toContain('sana xato')
  })

  it('hides the center checkbox unless canScopeToCenter', () => {
    mountModal(makeState())
    expect(document.body.querySelector('input[type="checkbox"]')).toBeNull()
    expect(document.body.textContent).not.toContain(t('holidays.form.onlyCenter', { center: 'Markaz 2' }))
  })

  it('shows the center checkbox with the center name and emits its change', async () => {
    const wrapper = mountModal(makeState(), true, 'Markaz 2')
    expect(document.body.textContent).toContain(t('holidays.form.onlyCenter', { center: 'Markaz 2' }))

    const box = document.body.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    box.checked = true
    box.dispatchEvent(new Event('change'))
    await flushPromises()

    expect(wrapper.emitted('change')).toContainEqual([{ onlyActiveCenter: true }])
  })

  it('emits change with the typed name', async () => {
    const wrapper = mountModal(makeState())
    const input = document.body.querySelector<HTMLInputElement>('input:not([type="checkbox"])')!
    input.value = "Navro'z"
    input.dispatchEvent(new Event('input'))
    await flushPromises()

    expect(wrapper.emitted('change')).toContainEqual([{ name: "Navro'z" }])
  })

  it('emits change with a picked date (first of a range) without mutating state', async () => {
    const state = makeState()
    const wrapper = mountModal(state)
    const pickers = wrapper.findAllComponents(UiDatepickerStub)
    const d1 = new Date(2026, 2, 21)
    const d2 = new Date(2026, 2, 23)

    pickers[0]!.vm.$emit('update:modelValue', d1)
    pickers[1]!.vm.$emit('update:modelValue', [d2])
    await flushPromises()

    expect(wrapper.emitted('change')).toEqual([[{ fromDate: d1 }], [{ toDate: d2 }]])
    expect(state.fromDate).toBeNull()
  })

  it('emits submit on Save and close on Cancel', async () => {
    const wrapper = mountModal(makeState())

    findButton(t('common.save')).click()
    await flushPromises()
    expect(wrapper.emitted('submit')).toHaveLength(1)

    findButton(t('common.cancel')).click()
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('disables Cancel while saving', () => {
    mountModal(makeState({ saving: true }))
    expect(findButton(t('common.cancel')).disabled).toBe(true)
  })
})
