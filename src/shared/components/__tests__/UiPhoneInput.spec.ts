import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiPhoneInput from '../UiPhoneInput.vue'
import UiForm from '../UiForm.vue'
import { t } from '@/locales'

const lastEmit = (w: { emitted: (e: string) => unknown[][] | undefined }) => {
  const all = w.emitted('update:modelValue') ?? []
  return all[all.length - 1]
}

describe('UiPhoneInput', () => {
  it('shows a fixed +998 prefix and the translated placeholder', () => {
    const wrapper = mount(UiPhoneInput, { props: { label: 'Tel' } })
    expect(wrapper.text()).toContain('+998')
    expect(wrapper.get('input').attributes('placeholder')).toBe(t('common.phonePlaceholder'))
    expect(wrapper.get('input').attributes('autocomplete')).toBe('off')
    expect(wrapper.get('input').attributes('inputmode')).toBe('numeric')
  })

  it('groups typed digits and emits the stored +998 form', async () => {
    const wrapper = mount(UiPhoneInput)
    const input = wrapper.get('input')
    await input.setValue('977522014')
    expect(lastEmit(wrapper)).toEqual(['+998977522014'])
    expect((input.element as HTMLInputElement).value).toBe('97 752 20 14')
  })

  it('keeps a partial number as typed under v-model (the +998 is not re-read as digits)', async () => {
    const wrapper = mount({
      components: { UiPhoneInput },
      data: () => ({ phone: '' }),
      template: `<UiPhoneInput v-model="phone" />`,
    })
    const input = wrapper.get('input')
    await input.setValue('9')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('9')
    expect(wrapper.vm.phone).toBe('+9989')
    await input.setValue('91')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('91')
  })

  it('types 911234567 digit by digit and erases it back without re-reading 998', async () => {
    const wrapper = mount({
      components: { UiPhoneInput },
      data: () => ({ phone: '' }),
      template: `<UiPhoneInput v-model="phone" />`,
    })
    const input = wrapper.get('input')
    const el = input.element as HTMLInputElement
    const full = '911234567'
    for (let i = 1; i <= full.length; i++) {
      await input.setValue(full.slice(0, i))
      await nextTick()
      expect(el.value.replace(/\s/g, '')).toBe(full.slice(0, i))
    }
    expect(wrapper.vm.phone).toBe('+998911234567')
    for (let i = full.length - 1; i >= 0; i--) {
      await input.setValue(el.value.replace(/\s/g, '').slice(0, i))
      await nextTick()
      expect(el.value.replace(/\s/g, '')).toBe(full.slice(0, i))
    }
    expect(wrapper.vm.phone).toBe('')
  })

  it('strips letters, a pasted 998 prefix and extra digits', async () => {
    const wrapper = mount(UiPhoneInput)
    await wrapper.get('input').setValue('+998 (97) 752-20-14 99')
    expect(lastEmit(wrapper)).toEqual(['+998977522014'])
  })

  it('emits an empty string when cleared', async () => {
    const wrapper = mount(UiPhoneInput, { props: { modelValue: '+998977522014' } })
    await wrapper.get('input').setValue('')
    expect(lastEmit(wrapper)).toEqual([''])
  })

  it.each(['97-752-20-14', '977522014', '+998977522014'])(
    'reads an old value %s back in the grouped form',
    (raw) => {
      const wrapper = mount(UiPhoneInput, { props: { modelValue: raw } })
      expect((wrapper.get('input').element as HTMLInputElement).value).toBe('97 752 20 14')
    },
  )

  it('shows the error and disables the field', () => {
    const wrapper = mount(UiPhoneInput, { props: { error: 'Bad', disabled: true } })
    expect(wrapper.text()).toContain('Bad')
    expect(wrapper.html()).toContain('border-danger')
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
  })

  it('registers with a surrounding UiForm through `name`', async () => {
    const wrapper = mount({
      components: { UiForm, UiPhoneInput },
      template: `<UiForm ref="form" :initial-values="{ phone: '' }"><UiPhoneInput name="phone" /></UiForm>`,
    })
    await wrapper.get('input').setValue('901234567')
    await nextTick()
    const form = wrapper.vm.$refs.form as { values: Record<string, unknown> }
    expect(form.values.phone).toBe('+998901234567')
  })
})
