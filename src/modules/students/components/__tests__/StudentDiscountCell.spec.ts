import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentDiscountCell from '../StudentDiscountCell.vue'
import type { Student } from '../../interfaces/student.interface'
import { StudentStatus } from '../../enums/student-status.enum'

const SHORT_REASON = '12345678901234567890' // exactly 20 chars
const LONG_REASON = '123456789012345678901' // 21 chars → truncated

function buildStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 1,
    firstName: 'Aziz',
    lastName: 'Karimov',
    phone: '+998901234567',
    status: StudentStatus.ACTIVE,
    ...overrides,
  }
}

describe('StudentDiscountCell', () => {
  it('renders a single "—" when there are no periods and no discount percent', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: { student: buildStudent() },
    })

    expect(wrapper.text()).toBe('—')
  })

  it('renders one row per discount period with the percent', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: {
        student: buildStudent({
          discountPeriods: [
            { id: 1, fromMonth: '2026-01-01', percent: 10 },
            { id: 2, fromMonth: '2026-02-01', percent: 20 },
          ],
        }),
      },
    })

    const rows = wrapper.findAll('.text-sm')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.text()).toContain('10%')
    expect(rows[1]!.text()).toContain('20%')
  })

  it('shows a short period reason in full with no title attribute', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: {
        student: buildStudent({
          discountPeriods: [{ id: 1, fromMonth: '2026-01-01', percent: 10, reason: SHORT_REASON }],
        }),
      },
    })

    const reasonSpan = wrapper.find('.text-muted-foreground')
    expect(reasonSpan.text()).toBe(`— ${SHORT_REASON}`)
    expect(reasonSpan.attributes('title')).toBeUndefined()
  })

  it('truncates a long period reason and keeps the full text in the title', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: {
        student: buildStudent({
          discountPeriods: [{ id: 1, fromMonth: '2026-01-01', percent: 10, reason: LONG_REASON }],
        }),
      },
    })

    const reasonSpan = wrapper.find('.text-muted-foreground')
    expect(reasonSpan.text()).toBe(`— ${LONG_REASON.slice(0, 20)}…`)
    expect(reasonSpan.attributes('title')).toBe(LONG_REASON)
  })

  it('falls back to discountPercent/discountReason when there are no periods', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: {
        student: buildStudent({ discountPercent: '15', discountReason: SHORT_REASON }),
      },
    })

    expect(wrapper.text()).toContain('15%')
    const reasonSpan = wrapper.find('.text-muted-foreground')
    expect(reasonSpan.text()).toBe(SHORT_REASON)
    expect(reasonSpan.attributes('title')).toBeUndefined()
  })

  it('truncates a long discountReason and keeps the full text in the title', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: {
        student: buildStudent({ discountPercent: '15', discountReason: LONG_REASON }),
      },
    })

    const reasonSpan = wrapper.find('.text-muted-foreground')
    expect(reasonSpan.text()).toBe(`${LONG_REASON.slice(0, 20)}…`)
    expect(reasonSpan.attributes('title')).toBe(LONG_REASON)
  })

  it('renders only the percent when discountPercent has no reason', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: { student: buildStudent({ discountPercent: '15' }) },
    })

    expect(wrapper.text()).toBe('15%')
  })

  it('prefers periods over discountPercent when both are present', () => {
    const wrapper = mount(StudentDiscountCell, {
      props: {
        student: buildStudent({
          discountPeriods: [{ id: 1, fromMonth: '2026-01-01', percent: 10 }],
          discountPercent: '99',
        }),
      },
    })

    expect(wrapper.text()).toContain('10%')
    expect(wrapper.text()).not.toContain('99%')
  })
})
