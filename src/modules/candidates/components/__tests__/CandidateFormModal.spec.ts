import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CandidateFormModal from '../CandidateFormModal.vue'
import { UiForm } from '@/shared/components'
import { t } from '@/locales'
import type { Candidate } from '../../interfaces/candidate.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const subjects: SelectOption[] = [
  { label: 'Matematika', value: 2 },
  { label: 'Fizika', value: 3 },
]

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 11,
    centerId: 5,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '+998977522014',
    experience: '3 yil',
    birthYear: 1995,
    subjectId: 2,
    subject: { id: 2, name: 'Matematika' },
    address: 'Toshkent',
    comment: 'Izoh matni',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

function mountModal(editing: Candidate | null = null, defaultCenterId: number | null = 5) {
  // UiModal teleports its content to <body> — assert on the real DOM.
  return mount(CandidateFormModal, {
    attachTo: document.body,
    props: { modelValue: true, editing, defaultCenterId, subjects },
  })
}

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === label,
  )
  if (!button) throw new Error(`button not found: ${label}`)
  return button
}

function formValues(wrapper: ReturnType<typeof mountModal>) {
  return wrapper.findComponent(UiForm).vm.values as Record<string, unknown>
}

describe('CandidateFormModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the create title when not editing', () => {
    mountModal()
    expect(document.body.textContent).toContain(t('candidates.createTitle'))
    expect(document.body.textContent).not.toContain(t('candidates.editTitle'))
  })

  it('shows the edit title when editing', () => {
    mountModal(makeCandidate())
    expect(document.body.textContent).toContain(t('candidates.editTitle'))
  })

  it('pre-fills the form from the editing candidate', () => {
    const wrapper = mountModal(makeCandidate())

    expect(formValues(wrapper)).toMatchObject({
      centerId: 5,
      lastName: 'Valiyev',
      firstName: 'Ali',
      phone: '+998977522014',
      birthYear: 1995,
      experience: '3 yil',
      subjectId: 2,
      address: 'Toshkent',
      comment: 'Izoh matni',
    })
    const inputs = Array.from(document.body.querySelectorAll<HTMLInputElement>('input'))
    expect(inputs.some((i) => i.value === 'Valiyev')).toBe(true)
    expect(inputs.some((i) => i.value === '97 752 20 14')).toBe(true)
  })

  it('uses the default center and empty fields when creating', () => {
    const wrapper = mountModal(null, 7)
    expect(formValues(wrapper)).toMatchObject({ centerId: 7, lastName: '', subjectId: null })
  })

  it('does not emit submit and shows errors when the form is invalid', async () => {
    const wrapper = mountModal()

    await wrapper.findComponent(UiForm).vm.submit()
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('candidates.validation.lastName'))
    expect(text).toContain(t('candidates.validation.phone'))
  })

  it('emits submit with the values when the form is valid', async () => {
    const wrapper = mountModal(makeCandidate())

    await wrapper.findComponent(UiForm).vm.submit()
    await flushPromises()

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({ lastName: 'Valiyev', birthYear: 1995, subjectId: 2 })
  })

  it('submits through the Save button', async () => {
    const wrapper = mountModal(makeCandidate())

    findButton(t('common.save')).click()
    // The button calls the form's exposed submit() without awaiting it — wait for validation.
    await vi.waitFor(() => expect(wrapper.emitted('submit')).toHaveLength(1))
  })

  it('emits update:modelValue false on Cancel', async () => {
    const wrapper = mountModal()

    findButton(t('common.cancel')).click()
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })
})
