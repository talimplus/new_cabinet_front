import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackdateImpact from '../BackdateImpact.vue'
import { t } from '@/locales'
import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'

function makePreview(overrides: Partial<BackdatePreview> = {}): BackdatePreview {
  return {
    rows: [
      {
        studentId: 1, studentName: 'Ali Valiyev', groupId: 2, groupName: 'A1', forMonth: '2026-10-01',
        isNew: true, currentDue: 0, newDue: 415384.62, amountPaid: 0, refund: 0,
      },
      {
        studentId: 3, studentName: 'Vali Aliyev', groupId: 2, groupName: 'A1', forMonth: '2026-10-01',
        isNew: false, currentDue: 553846.15, newDue: 415384.62, amountPaid: 553846.15, refund: 138461.53,
      },
    ],
    totals: { debtIncrease: 415384.62, debtDecrease: 0, refund: 138461.53 },
    paidSalaryMonths: [],
    ...overrides,
  }
}

describe('BackdateImpact', () => {
  it('shows a spinner while loading and nothing else', () => {
    const w = mount(BackdateImpact, { props: { preview: makePreview(), loading: true } })
    expect(w.text()).not.toContain('Ali Valiyev')
  })

  it('says nothing changes when there are no rows', () => {
    const w = mount(BackdateImpact, { props: { preview: makePreview({ rows: [], totals: { debtIncrease: 0, debtDecrease: 0, refund: 0 } }) } })
    expect(w.text()).toContain(t('common.backdate.noChanges'))
  })

  it('renders only the non-zero totals and every changed row', () => {
    const w = mount(BackdateImpact, { props: { preview: makePreview() } })
    expect(w.text()).toContain(t('common.backdate.debtIncrease'))
    expect(w.text()).toContain(t('common.backdate.refund'))
    expect(w.text()).not.toContain(t('common.backdate.debtDecrease'))
    expect(w.text()).toContain('Ali Valiyev')
    expect(w.text()).toContain(t('common.backdate.newRow'))
    expect(w.findAll('li')).toHaveLength(2)
  })

  it('lists months whose teacher salary is already paid', () => {
    const w = mount(BackdateImpact, {
      props: { preview: makePreview({ paidSalaryMonths: [{ teacherId: 9, teacherName: 'Ustoz', forMonth: '2026-10-01' }] }) },
    })
    expect(w.text()).toContain(t('common.backdate.paidSalaryTitle'))
    expect(w.text()).toContain('Ustoz')
    expect(w.text()).toContain('10.2026')
  })
})
