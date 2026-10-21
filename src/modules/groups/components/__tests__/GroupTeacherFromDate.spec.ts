import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupTeacherFromDate from '../GroupTeacherFromDate.vue'
import { t } from '@/locales'

const UiDatepickerStub = {
  name: 'UiDatepicker',
  props: ['modelValue', 'label', 'error', 'maxDate'],
  emits: ['update:modelValue'],
  template: '<div class="dp-stub">{{ label }}<span class="err">{{ error }}</span></div>',
}

const mountIt = (error?: string) =>
  mount(GroupTeacherFromDate, {
    props: { modelValue: null, error },
    global: { stubs: { UiDatepicker: UiDatepickerStub } },
  })

describe('GroupTeacherFromDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('passes label, hint, today as maxDate and the error through', () => {
    const w = mountIt('Kelajak sana mumkin emas')
    const dp = w.getComponent(UiDatepickerStub)
    expect(dp.props('label')).toBe(t('groups.form.teacherEffectiveFrom'))
    expect((dp.props('maxDate') as Date).getTime()).toBe(new Date(2026, 9, 21, 12, 0, 0).getTime())
    expect(dp.props('error')).toBe('Kelajak sana mumkin emas')
    expect(w.text()).toContain(t('groups.form.teacherEffectiveFromHint'))
  })

  it('unwraps an array value on update', async () => {
    const w = mountIt()
    const d = new Date(2026, 9, 1)
    w.getComponent(UiDatepickerStub).vm.$emit('update:modelValue', [d])
    expect(w.emitted('update:modelValue')).toEqual([[d]])
  })

  it('forwards a single date and null', () => {
    const w = mountIt()
    const d = new Date(2026, 9, 2)
    const dp = w.getComponent(UiDatepickerStub)
    dp.vm.$emit('update:modelValue', d)
    dp.vm.$emit('update:modelValue', null)
    dp.vm.$emit('update:modelValue', [])
    expect(w.emitted('update:modelValue')).toEqual([[d], [null], [null]])
  })
})
