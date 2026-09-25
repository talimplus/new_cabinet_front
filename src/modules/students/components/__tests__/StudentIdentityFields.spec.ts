import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentIdentityFields from '../StudentIdentityFields.vue'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

function tab(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((b) => b.text() === label)!
}

describe('StudentIdentityFields', () => {
  it('emits update:passportSeries when typing in the passport series field', async () => {
    const wrapper = mount(StudentIdentityFields, {
      props: { passportSeries: '', passportNumber: '', jshshir: '' },
    })

    // Passport tab is active by default (no jshshir) → two inputs.
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(2)

    await inputs[0]!.setValue('AA')
    expect(last(wrapper.emitted('update:passportSeries'))).toEqual(['AA'])
  })

  it('emits update:jshshir when typing in the JSHSHIR field', async () => {
    const wrapper = mount(StudentIdentityFields, {
      // A truthy jshshir makes the JSHSHIR tab active on mount.
      props: { passportSeries: '', passportNumber: '', jshshir: '1' },
    })

    const input = wrapper.find('input')
    await input.setValue('12345678901234')
    expect(last(wrapper.emitted('update:jshshir'))).toEqual(['12345678901234'])
  })

  it('clears passport fields when switching to the JSHSHIR tab', async () => {
    const wrapper = mount(StudentIdentityFields, {
      props: { passportSeries: 'AA', passportNumber: '1234567', jshshir: '' },
    })

    await tab(wrapper, 'JSHSHIR').trigger('click')

    expect(last(wrapper.emitted('update:passportSeries'))).toEqual([''])
    expect(last(wrapper.emitted('update:passportNumber'))).toEqual([''])
  })

  it('clears the jshshir field when switching back to the Passport tab', async () => {
    const wrapper = mount(StudentIdentityFields, {
      props: { passportSeries: '', passportNumber: '', jshshir: '12345678901234' },
    })

    await tab(wrapper, 'Passport').trigger('click')

    expect(last(wrapper.emitted('update:jshshir'))).toEqual([''])
  })
})
