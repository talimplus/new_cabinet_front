import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import GroupDatesFields from '../GroupDatesFields.vue'
import { t } from '@/locales'
import { useBrandingStore } from '@/stores/branding.store'

const UiDatepickerStub = {
  name: 'UiDatepicker',
  props: ['modelValue', 'label', 'error', 'hint', 'minDate'],
  emits: ['update:modelValue'],
  template: '<div class="dp-stub">{{ label }}<span class="err">{{ error }}</span></div>',
}

const mountIt = () =>
  mount(GroupDatesFields, {
    props: { startDate: null, endDate: null, errors: { endDate: 'xato' } },
    global: { stubs: { UiDatepicker: UiDatepickerStub } },
  })

describe('GroupDatesFields', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('renders the start and end pickers with their errors', () => {
    const w = mountIt()
    const [start, end] = w.findAllComponents(UiDatepickerStub)
    expect(start!.props('label')).toBe(t('groups.form.startDate'))
    expect(end!.props('label')).toBe(t('groups.form.endDate'))
    expect(end!.props('error')).toBe('xato')
  })

  it('emits each date separately, unwrapping arrays', () => {
    const w = mountIt()
    const d = new Date(2026, 9, 5)
    const [start, end] = w.findAllComponents(UiDatepickerStub)
    start!.vm.$emit('update:modelValue', [d])
    end!.vm.$emit('update:modelValue', null)
    expect(w.emitted('update:startDate')).toEqual([[d]])
    expect(w.emitted('update:endDate')).toEqual([[null]])
  })

  it('blocks a start before the organization opened (minDate), not the end date', () => {
    const branding = useBrandingStore()
    branding.branding = { organizationId: 1, name: 'X', logoUrl: null, faviconUrl: null, brandingUpdatedAt: null, openedOn: '2026-09-05' }
    const w = mountIt()
    const [start, end] = w.findAllComponents(UiDatepickerStub)
    expect((start!.props('minDate') as Date).getTime()).toBe(new Date(2026, 8, 5).getTime())
    expect(end!.props('minDate')).toBeUndefined()
  })
})
