import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import ProfileForm from '../ProfileForm.vue'
import { UiButton } from '@/shared/components'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    login: z.string().min(1),
    phone: z.string().min(1),
    password: z.string().optional(),
  }),
)

const initialValues = {
  firstName: 'Ali',
  lastName: 'Valiyev',
  login: 'ali',
  phone: '998901112233',
  password: '',
}

function mountForm(overrides: Record<string, unknown> = {}) {
  return mount(ProfileForm, {
    props: {
      formKey: 'profile-1',
      schema,
      initialValues,
      isTeacher: false,
      salary: null,
      commissionPercentage: null,
      loading: false,
      isDirty: () => false,
      ...overrides,
    },
  })
}

function saveButton(wrapper: ReturnType<typeof mountForm>) {
  const buttons = wrapper.findAllComponents(UiButton)
  const save = buttons.find((b) => b.text() === t('common.save'))
  if (!save) throw new Error('Save button not found')
  return save
}

describe('ProfileForm', () => {
  it('renders the four editable inputs and the password field', () => {
    const wrapper = mountForm()
    const inputs = wrapper.findAll('input')
    // firstName, lastName, login, phone, password
    expect(inputs.length).toBe(5)
    expect(wrapper.text()).toContain(t('profile.firstName'))
    expect(wrapper.text()).toContain(t('profile.lastName'))
    expect(wrapper.text()).toContain(t('profile.login'))
    expect(wrapper.text()).toContain(t('common.phone'))
    expect(wrapper.text()).toContain(t('profile.newPassword'))
  })

  it('does not render the read-only salary/commission inputs when isTeacher is false', () => {
    const wrapper = mountForm({ isTeacher: false })
    expect(wrapper.text()).not.toContain(t('profile.salary'))
    expect(wrapper.text()).not.toContain(t('profile.commissionPercentage'))
    expect(wrapper.findAll('input').length).toBe(5)
  })

  it('renders the read-only salary/commission inputs when isTeacher is true', () => {
    const wrapper = mountForm({ isTeacher: true, salary: 2000000, commissionPercentage: 40 })
    expect(wrapper.text()).toContain(t('profile.salary'))
    expect(wrapper.text()).toContain(t('profile.commissionPercentage'))
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(7)

    const readonlyInputs = inputs.filter((i) => i.attributes('readonly') !== undefined)
    expect(readonlyInputs).toHaveLength(2)
    expect((readonlyInputs[0]!.element as HTMLInputElement).value).toBe(formatSom(2000000))
    expect((readonlyInputs[1]!.element as HTMLInputElement).value).toBe('40%')
  })

  it('disables the Save button when isDirty(values) returns false', () => {
    const wrapper = mountForm({ isDirty: () => false })
    const save = saveButton(wrapper)
    expect(save.props('disabled') ?? save.attributes('disabled') !== undefined).toBeTruthy()
  })

  // vee-validate's handleSubmit resolves over a couple of extra microtask/task
  // hops when triggered via a native click event (vs. calling submit()
  // directly) — poll with vi.waitFor (real timers) instead of a single
  // flushPromises().
  it('calls formRef.submit() and emits submit when Save is clicked while dirty', async () => {
    const wrapper = mountForm({ isDirty: () => true })

    await saveButton(wrapper).trigger('click')

    await vi.waitFor(() => expect(wrapper.emitted('submit')).toBeTruthy())

    const payload = wrapper.emitted('submit')![0]![0] as Record<string, unknown>
    expect(payload).toMatchObject({
      firstName: 'Ali',
      lastName: 'Valiyev',
      login: 'ali',
      phone: '998901112233',
    })
  })
})
