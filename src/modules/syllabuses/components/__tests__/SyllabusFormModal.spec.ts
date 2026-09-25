import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Multiselect from '@vueform/multiselect'
import SyllabusFormModal from '../SyllabusFormModal.vue'
import { UiForm, UiInput, UiTextarea } from '@/shared/components'
import { createSyllabus as createSyllabusApi, updateSyllabus as updateSyllabusApi } from '../../api/syllabuses.api'
import { t } from '@/locales'
import type { Syllabus } from '../../interfaces/syllabus.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

vi.mock('../../api/syllabuses.api', () => ({
  createSyllabus: vi.fn(),
  updateSyllabus: vi.fn(),
}))

const mockedCreate = vi.mocked(createSyllabusApi)
const mockedUpdate = vi.mocked(updateSyllabusApi)

const subjects: SelectOption[] = [
  { label: 'Matematika', value: 2 },
  { label: 'Fizika', value: 3 },
]

function makeSyllabus(overrides: Partial<Syllabus> = {}): Syllabus {
  return {
    id: 5,
    name: 'Eski reja',
    description: 'Eski tavsif',
    subject: { id: 2, name: 'Matematika' },
    topics: [],
    ...overrides,
  }
}

function mountModal(props: { editing?: Syllabus | null } = {}) {
  return mount(SyllabusFormModal, {
    attachTo: document.body,
    props: { modelValue: true, subjects, editing: props.editing ?? null },
  })
}

async function selectSubject(wrapper: ReturnType<typeof mountModal>, value: number) {
  await wrapper.findComponent(Multiselect).vm.$emit('update:modelValue', value)
}

describe('SyllabusFormModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the add title when creating', () => {
    // UiModal teleports its content to <body> — assert on the real DOM (see
    // PaymentHistoryModal.spec.ts for the same pattern).
    mountModal()
    expect(document.body.textContent).toContain(t('syllabuses.addTitle'))
    expect(document.body.textContent).not.toContain(t('syllabuses.editTitle'))
  })

  it('shows the edit title when editing', () => {
    mountModal({ editing: makeSyllabus() })
    expect(document.body.textContent).toContain(t('syllabuses.editTitle'))
  })

  it('pre-fills name/description and submits updateSyllabus with the id and edited values', async () => {
    const editing = makeSyllabus()
    mockedUpdate.mockResolvedValueOnce(editing)
    const wrapper = mountModal({ editing })

    expect(wrapper.findComponent(UiInput).get('input').element.value).toBe('Eski reja')
    expect(wrapper.findComponent(UiTextarea).get('textarea').element.value).toBe('Eski tavsif')

    await wrapper.findComponent(UiInput).get('input').setValue('Yangi nomi')
    await wrapper.findComponent(UiForm).vm.submit()
    await flushPromises()

    expect(mockedUpdate).toHaveBeenCalledWith(5, {
      name: 'Yangi nomi',
      subjectId: 2,
      description: 'Eski tavsif',
    })
    const modelUpdates = wrapper.emitted('update:modelValue')
    expect(modelUpdates?.[modelUpdates.length - 1]).toEqual([false])
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it('creates a syllabus from the entered values', async () => {
    mockedCreate.mockResolvedValueOnce(makeSyllabus({ id: 9 }))
    const wrapper = mountModal()

    await wrapper.findComponent(UiInput).get('input').setValue('Yangi reja')
    await selectSubject(wrapper, 3)
    await wrapper.findComponent(UiTextarea).get('textarea').setValue('Tavsif matni')
    await wrapper.findComponent(UiForm).vm.submit()
    await flushPromises()

    expect(mockedCreate).toHaveBeenCalledWith({
      name: 'Yangi reja',
      subjectId: 3,
      description: 'Tavsif matni',
    })
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('sends description: undefined on create when left blank', async () => {
    mockedCreate.mockResolvedValueOnce(makeSyllabus({ id: 9 }))
    const wrapper = mountModal()

    await wrapper.findComponent(UiInput).get('input').setValue('Yangi reja')
    await selectSubject(wrapper, 2)
    await wrapper.findComponent(UiForm).vm.submit()
    await flushPromises()

    expect(mockedCreate).toHaveBeenCalledWith({
      name: 'Yangi reja',
      subjectId: 2,
      description: undefined,
    })
  })

  it('sends description: "" on update when the description is cleared', async () => {
    const editing = makeSyllabus()
    mockedUpdate.mockResolvedValueOnce(editing)
    const wrapper = mountModal({ editing })

    await wrapper.findComponent(UiTextarea).get('textarea').setValue('')
    await wrapper.findComponent(UiForm).vm.submit()
    await flushPromises()

    expect(mockedUpdate).toHaveBeenCalledWith(5, {
      name: 'Eski reja',
      subjectId: 2,
      description: '',
    })
  })
})
