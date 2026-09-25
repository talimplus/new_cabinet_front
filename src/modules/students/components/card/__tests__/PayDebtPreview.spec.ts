import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PayDebtPreview from '../PayDebtPreview.vue'
import { formatMonth } from '@/shared/utils/format-month'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { DebtAllocation } from '../../../interfaces/pay-debt.interface'

describe('PayDebtPreview', () => {
  it('shows the empty message with no rows', () => {
    const wrapper = mount(PayDebtPreview, { props: { rows: [] } })
    expect(wrapper.text()).toContain(t('students.view.modal.previewEmpty'))
  })

  it('renders one line per allocation with formatted month, group name and amount', () => {
    const rows: DebtAllocation[] = [
      { forMonth: '2026-08', groupName: 'Group A', allocated: 100000 },
      { forMonth: '2026-09', groupName: 'Group B', allocated: 250000 },
    ]
    const wrapper = mount(PayDebtPreview, { props: { rows } })
    expect(wrapper.text()).not.toContain(t('students.view.modal.previewEmpty'))

    const lines = wrapper.findAll('.border-t')
    expect(lines).toHaveLength(2)

    expect(lines[0]!.text()).toContain(formatMonth('2026-08'))
    expect(lines[0]!.text()).toContain('Group A')
    expect(lines[0]!.text()).toContain(formatSom(100000))

    expect(lines[1]!.text()).toContain(formatMonth('2026-09'))
    expect(lines[1]!.text()).toContain('Group B')
    expect(lines[1]!.text()).toContain(formatSom(250000))
  })
})
