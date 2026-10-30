import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import GroupStartDialog from '../GroupStartDialog.vue'
import { GroupStartMode } from '../../enums/group-start-mode.enum'
import { StudentStatus } from '@/modules/students/enums/student-status.enum'
import { t } from '@/locales'
import type { GroupStartPreview } from '../../interfaces/group-start.interface'

function makePreview(overrides: Partial<GroupStartPreview> = {}): GroupStartPreview {
  return {
    startDate: '2026-10-05', prevStartDate: '2026-10-30', attendanceBefore: 0,
    candidates: [{ studentId: 11, fullName: 'Ali Valiyev', status: StudentStatus.ACTIVE, joinedAt: '2026-10-30' }],
    rows: [{
      studentId: 11, studentName: 'Ali Valiyev', groupId: 2, groupName: 'A1', forMonth: '2026-10-01',
      isNew: false, currentDue: 46153.85, newDue: 553846.15, amountPaid: 0, refund: 0,
    }],
    totals: { debtIncrease: 507692.3, debtDecrease: 0, refund: 0 },
    paidSalaryMonths: [],
    ...overrides,
  }
}

const mountIt = (props: Partial<InstanceType<typeof GroupStartDialog>['$props']> = {}) =>
  mount(GroupStartDialog, {
    attachTo: document.body,
    props: {
      open: true, mode: GroupStartMode.START, date: new Date(2026, 9, 5),
      preview: makePreview(), selected: [11], canConfirm: true, ...props,
    },
  })

const confirmButton = () => document.body.querySelector<HTMLButtonElement>('[data-test="start-confirm"]')!

describe('GroupStartDialog', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => { document.body.innerHTML = '' })

  it('START: asks when lessons began and shows the impact with a warning', async () => {
    mountIt()
    await flushPromises()
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('groups.start.title'))
    expect(text).toContain(t('groups.start.date'))
    expect(text).toContain(t('groups.start.candidatesTitle'))
    expect(text).toContain(t('common.backdate.warning'))
    expect(confirmButton().textContent).toContain(t('common.backdate.confirm'))
  })

  it('EDIT: shows the old → new dates instead of a picker', async () => {
    mountIt({ mode: GroupStartMode.EDIT })
    await flushPromises()
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('groups.start.editTitle'))
    expect(text).not.toContain(t('groups.start.date'))
    expect(text).toContain('05.10.2026')
  })

  it('warns about attendance and keeps Confirm disabled when blocked', async () => {
    mountIt({ preview: makePreview({ attendanceBefore: 2 }), canConfirm: false })
    await flushPromises()
    expect(document.body.textContent).toContain(t('groups.start.attendanceBlock', { count: 2 }))
    expect(confirmButton().disabled).toBe(true)
  })

  it('emits confirm, toggle and close', async () => {
    const w = mountIt()
    await flushPromises()
    confirmButton().click()
    document.body.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click()
    const cancel = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent?.trim() === t('common.cancel'))!
    cancel.click()
    await flushPromises()
    expect(w.emitted('confirm')).toHaveLength(1)
    expect(w.emitted('toggle')).toEqual([[11, false]])
    expect(w.emitted('close')).toBeTruthy()
  })
})
