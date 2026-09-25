import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import UiForm from '../UiForm.vue'
import UiInput from '../UiInput.vue'

// A host wiring a validated UiInput inside UiForm, exposing the form ref and
// captured submit payloads. `formRef.submit()` runs the same handler the
// native submit button triggers (jsdom doesn't reliably dispatch form submit).
function mountHost() {
  const submitted: Record<string, unknown>[] = []
  const formRef = ref()
  const Host = defineComponent({
    setup: (_, { expose }) => {
      expose({ formRef })
      const schema = toTypedSchema(z.object({ email: z.string().email('Email noto‘g‘ri') }))
      return () =>
        h(UiForm, { ref: formRef, validationSchema: schema, onSubmit: (v) => submitted.push(v) }, () => [
          h(UiInput, { name: 'email', label: 'Email' }),
        ])
    },
  })
  return { wrapper: mount(Host), submitted, form: () => formRef.value }
}

describe('UiForm + vee-validate', () => {
  it('blocks submit and shows a validation error for invalid input', async () => {
    const { wrapper, submitted, form } = mountHost()
    await wrapper.get('input').setValue('not-an-email')
    await form().submit()
    await flushPromises()
    expect(wrapper.text()).toContain('Email noto‘g‘ri')
    expect(submitted).toHaveLength(0)
  })

  it('emits the values on a valid submit', async () => {
    const { wrapper, submitted, form } = mountHost()
    await wrapper.get('input').setValue('a@b.uz')
    await form().submit()
    await flushPromises()
    expect(submitted).toEqual([{ email: 'a@b.uz' }])
  })

  it('maps backend errors onto the matching field via setBackendErrors', async () => {
    const { wrapper, form } = mountHost()
    form().setBackendErrors({ response: { data: { errors: { email: ['Bu email band'] } } } })
    await flushPromises()
    expect(wrapper.text()).toContain('Bu email band')
  })
})
