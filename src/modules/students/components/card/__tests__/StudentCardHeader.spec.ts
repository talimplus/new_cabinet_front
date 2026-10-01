import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentCardHeader from '../StudentCardHeader.vue'
import { StudentStatus, STUDENT_STATUS_LABEL_KEYS } from '../../../enums/student-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { UiBadge } from '@/shared/components'
import { t } from '@/locales'
import type { StudentSummaryProfile } from '../../../interfaces/student-summary.interface'

function makeStudent(overrides: Partial<StudentSummaryProfile> = {}): StudentSummaryProfile {
  return {
    id: 1,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '+998901234567',
    status: StudentStatus.ACTIVE,
    monthlyFee: 500000,
    discountPercent: 0,
    centerId: 1,
    groups: [],
    ...overrides,
  }
}

function mountHeader(props: Record<string, unknown> = {}) {
  return mount(StudentCardHeader, { props: { student: makeStudent(), ...props } })
}

describe('StudentCardHeader', () => {
  it('renders the full name, phone and formatted monthly fee', () => {
    const text = mountHeader().text()
    expect(text).toContain('Ali Valiyev')
    expect(text).toContain(`${t('students.view.card.phone')}: +998901234567`)
    expect(text).toContain(formatSom(500000))
  })

  it('falls back to "—" for a missing phone', () => {
    expect(mountHeader({ student: makeStudent({ phone: '' }) }).text()).toContain(
      `${t('students.view.card.phone')}: —`,
    )
  })

  it('renders the status badge with the matching label key', () => {
    const text = mountHeader({ student: makeStudent({ status: StudentStatus.STOPPED }) }).text()
    expect(text).toContain(t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.STOPPED]))
  })

  it('derives initials from the uppercased first letters of first+last name', () => {
    const text = mountHeader({ student: makeStudent({ firstName: 'ali', lastName: 'valiyev' }) }).text()
    expect(text).toContain('AV')
  })

  it('renders nothing for money/name when student is null', () => {
    const wrapper = mountHeader({ student: null })
    expect(wrapper.text()).not.toContain('undefined')
    expect(wrapper.findComponent(UiBadge).exists()).toBe(false)
  })

  it('shows the edit button only with canEdit and emits edit on click', async () => {
    expect(mountHeader({ canEdit: false }).findAll('button')).toHaveLength(0)

    const wrapper = mountHeader({ canEdit: true })
    const button = wrapper.get('button')
    expect(button.text()).toContain(t('common.edit'))
    await button.trigger('click')
    expect(wrapper.emitted('edit')).toHaveLength(1)
  })

  it('shows the delete button only when canDelete is set and emits delete', async () => {
    const byText = (w: ReturnType<typeof mountHeader>) =>
      w.findAll('button').filter((b) => b.text().includes(t('common.delete')))
    expect(byText(mountHeader())).toHaveLength(0)

    const wrapper = mountHeader({ canDelete: true })
    const [button] = byText(wrapper)
    expect(button).toBeDefined()
    await button!.trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })
})
