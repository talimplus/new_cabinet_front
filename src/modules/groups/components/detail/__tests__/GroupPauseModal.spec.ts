import { describe, it, expect, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import GroupPauseModal from '../GroupPauseModal.vue'
import { t } from '@/locales'
import type { PauseFormState } from '../../../composables/use-group-pauses'

const UiDatepickerStub = {
  name: 'UiDatepicker',
  props: ['modelValue', 'label', 'error'],
  emits: ['update:modelValue'],
  template: '<div class="dp-stub">{{ label }}<span class="dp-error">{{ error }}</span></div>',
}

function makeState(overrides: Partial<PauseFormState> = {}): PauseFormState {
  return reactive({
    open: true, fromDate: null, toDate: null, reason: '', saving: false, errors: {},
    ...overrides,
  })
}

function mountModal(state: PauseFormState) {
  // UiModal teleports its content to <body> — assert on the real DOM.
  return mount(GroupPauseModal, {
    attachTo: document.body,
    props: { state },
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

describe('GroupPauseModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when the state is closed', () => {
    mountModal(makeState({ open: false }))
    expect(document.body.textContent).not.toContain(t('groups.pauses.addTitle'))
  })

  it('renders the title, both date fields, reason and hint when open', () => {
    mountModal(makeState())
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('groups.pauses.addTitle'))
    expect(text).toContain(t('groups.pauses.fromDate'))
    expect(text).toContain(t('groups.pauses.toDate'))
    expect(text).toContain(t('groups.pauses.reason'))
    expect(text).toContain(t('groups.pauses.hint'))
  })

  it('shows the field errors from the state', () => {
    mountModal(makeState({ errors: { fromDate: 'from xato', reason: 'sabab xato' } }))
    const text = document.body.textContent ?? ''
    expect(text).toContain('from xato')
    expect(text).toContain('sabab xato')
  })

  it('emits change with a picked date (first of a range)', async () => {
    const state = makeState()
    const wrapper = mountModal(state)
    const pickers = wrapper.findAllComponents(UiDatepickerStub)
    const d1 = new Date(2026, 9, 1)
    const d2 = new Date(2026, 9, 10)

    pickers[0]!.vm.$emit('update:modelValue', d1)
    pickers[1]!.vm.$emit('update:modelValue', [d2])
    await flushPromises()

    expect(wrapper.emitted('change')).toEqual([[{ fromDate: d1 }], [{ toDate: d2 }]])
    expect(state.fromDate).toBeNull()
  })

  it('emits submit on Save and close on Cancel', async () => {
    const state = makeState()
    const wrapper = mountModal(state)

    findButton(t('common.save')).click()
    await flushPromises()
    expect(wrapper.emitted('submit')).toHaveLength(1)

    findButton(t('common.cancel')).click()
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
