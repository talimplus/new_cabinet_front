import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupFeeHint from '../GroupFeeHint.vue'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

function mountHint(props: Record<string, unknown> = {}) {
  return mount(GroupFeeHint, {
    props: {
      feeChanged: true,
      applyFeeNow: false,
      currentFee: 400000,
      nextMonthLabel: '01.10.2026',
      ...props,
    },
  })
}

describe('GroupFeeHint', () => {
  it('renders nothing when feeChanged is false', () => {
    const wrapper = mountHint({ feeChanged: false })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('shows the applyFeeNow checkbox when feeChanged is true', () => {
    const wrapper = mountHint()
    expect(wrapper.text()).toContain(t('groups.form.applyFeeNow'))
    expect(wrapper.findComponent({ name: 'UiCheckbox' }).exists()).toBe(true)
  })

  it('shows the warning text when applyFeeNow is true', () => {
    const wrapper = mountHint({ applyFeeNow: true, currentFee: 400000 })
    expect(wrapper.text()).toContain(
      t('groups.form.feeApplyNowWarning', { fee: formatSom(400000) }),
    )
    expect(wrapper.text()).not.toContain(t('groups.form.feeNextMonthHint', { month: '01.10.2026' }))
  })

  it('shows the info hint when applyFeeNow is false', () => {
    const wrapper = mountHint({ applyFeeNow: false, nextMonthLabel: '01.10.2026' })
    expect(wrapper.text()).toContain(t('groups.form.feeNextMonthHint', { month: '01.10.2026' }))
  })

  it('emits update:applyFeeNow when the checkbox toggles', async () => {
    const wrapper = mountHint({ applyFeeNow: false })
    await wrapper.findComponent({ name: 'UiCheckbox' }).vm.$emit('update:modelValue', true)
    expect(wrapper.emitted('update:applyFeeNow')?.[0]).toEqual([true])
  })
})
