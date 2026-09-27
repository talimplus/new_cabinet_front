import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import AbsenceFollowUpModal from '../AbsenceFollowUpModal.vue'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import type { FollowUpState } from '../../composables/use-absences'
import type { Absence } from '../../interfaces/absence.interface'
import { t } from '@/locales'

function makeAbsence(overrides: Partial<Absence> = {}): Absence {
  return {
    id: 1,
    lessonDate: '2026-09-24',
    status: AttendanceStatus.EXCUSED,
    comment: 'Kasal',
    followUpNote: null,
    followedUpAt: null,
    followedUpBy: null,
    student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: '998901234567', secondPhone: null },
    group: { id: 3, name: 'English A1' },
    teacher: { id: 10, firstName: 'Olim', lastName: 'Karimov' },
    absencesInRange: 1,
    ...overrides,
  }
}

function makeState(overrides: Partial<FollowUpState> = {}): FollowUpState {
  return reactive({ row: makeAbsence(), note: 'Ertaga keladi', saving: false, ...overrides })
}

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

function mountModal(state: FollowUpState, open = true) {
  return mount(AbsenceFollowUpModal, { attachTo: document.body, props: { open, state } })
}

describe('AbsenceFollowUpModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    mountModal(makeState(), false)
    expect(document.body.textContent).not.toContain(t('absences.followUp.title'))
  })

  it('shows the student, group, lesson date and teacher note from state.row', () => {
    mountModal(makeState())
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('absences.followUp.title'))
    expect(text).toContain('Ali Valiyev')
    expect(text).toContain('English A1')
    expect(text).toContain('24.09.2026')
    expect(text).toContain(`${t('absences.table.teacherNote')}: Kasal`)
  })

  it('shows state.note and emits update:note on typing', async () => {
    const state = makeState()
    const wrapper = mountModal(state)
    const textarea = document.body.querySelector('textarea')!
    expect(textarea.value).toBe('Ertaga keladi')

    textarea.value = 'Kasal bo‘lgan'
    textarea.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:note')?.[0]).toEqual(['Kasal bo‘lgan'])
    expect(state.note).toBe('Ertaga keladi')
  })

  it('emits close when Cancel is clicked', async () => {
    const wrapper = mountModal(makeState())
    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits submit when Save is clicked', async () => {
    const wrapper = mountModal(makeState())
    findButton(t('common.save')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
