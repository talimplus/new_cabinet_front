import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ManualAttendanceModal from '../ManualAttendanceModal.vue'
import { t } from '@/locales'

interface ManualState {
  open: boolean
  userId: number | null
  workDate: string
  checkInTime: string
  note: string
  saving: boolean
}

function makeState(overrides: Partial<ManualState> = {}): ManualState {
  return {
    open: true,
    userId: null,
    workDate: '2026-09-24',
    checkInTime: '09:00',
    note: '',
    saving: false,
    ...overrides,
  }
}

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

function mountModal(state: ManualState) {
  return mount(ManualAttendanceModal, {
    attachTo: document.body,
    props: { state, employees: [{ label: 'Ali Valiyev', value: 10 }] },
  })
}

describe('ManualAttendanceModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the staff select, date, time and note fields', () => {
    mountModal(makeState())
    expect(document.body.textContent).toContain(t('staffAttendance.manual.staff'))
    expect(document.body.querySelector('input[type="date"]')).not.toBeNull()
    expect(document.body.querySelector('input[type="time"]')).not.toBeNull()
    expect(document.body.textContent).toContain(t('staffAttendance.manual.note'))
    expect(document.body.textContent).toContain(t('staffAttendance.manual.hint'))
  })

  it('disables Save when no employee is selected, and enables it once one is', () => {
    mountModal(makeState({ userId: null }))
    expect(findButton(t('common.save')).disabled).toBe(true)

    document.body.innerHTML = ''
    mountModal(makeState({ userId: 10 }))
    expect(findButton(t('common.save')).disabled).toBe(false)
  })

  it('emits submit when Save is clicked', async () => {
    const wrapper = mountModal(makeState({ userId: 10 }))
    findButton(t('common.save')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('emits close when Cancel is clicked', async () => {
    const wrapper = mountModal(makeState())
    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
