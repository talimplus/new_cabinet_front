import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import StudentStartDialog from '../StudentStartDialog.vue'
import { StudentStartMode } from '../../enums/student-start-mode.enum'
import { t } from '@/locales'
import type { StudentStartPreview } from '../../interfaces/student-start.interface'

const preview: StudentStartPreview = {
  startDate: '2026-10-12',
  rows: [{
    studentId: 1, studentName: 'Ali Valiyev', groupId: 2, groupName: 'A1', forMonth: '2026-10-01',
    isNew: true, currentDue: 0, newDue: 415384.62, amountPaid: 0, refund: 0,
  }],
  totals: { debtIncrease: 415384.62, debtDecrease: 0, refund: 0 },
  paidSalaryMonths: [],
}

const mountIt = (props: Record<string, unknown> = {}) =>
  mount(StudentStartDialog, {
    attachTo: document.body,
    props: { open: true, mode: StudentStartMode.ACTIVATE, date: new Date(2026, 9, 12), preview, canConfirm: true, ...props },
  })

const confirmButton = () => document.body.querySelector<HTMLButtonElement>('[data-test="student-start-confirm"]')!

describe('StudentStartDialog', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => { document.body.innerHTML = '' })

  it('ACTIVATE: shows the date picker, the impact and the warning', async () => {
    mountIt()
    await flushPromises()
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('students.start.title'))
    expect(text).toContain(t('students.start.date'))
    expect(text).toContain(t('common.backdate.warning'))
    expect(text).toContain('Ali Valiyev')
  })

  it('JOIN: states the join date instead of a picker', async () => {
    mountIt({ mode: StudentStartMode.JOIN })
    await flushPromises()
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('students.start.joinTitle'))
    expect(text).toContain('12.10.2026')
    expect(text).not.toContain(t('students.start.date'))
  })

  it('today needs no preview: plain confirm label', async () => {
    mountIt({ preview: null })
    await flushPromises()
    expect(document.body.textContent).not.toContain(t('common.backdate.warning'))
    expect(confirmButton().textContent).toContain(t('common.confirm'))
  })

  it('disables Confirm until allowed and emits confirm', async () => {
    const w = mountIt({ canConfirm: false })
    await flushPromises()
    expect(confirmButton().disabled).toBe(true)
    await w.setProps({ canConfirm: true })
    confirmButton().click()
    expect(w.emitted('confirm')).toHaveLength(1)
  })
})
