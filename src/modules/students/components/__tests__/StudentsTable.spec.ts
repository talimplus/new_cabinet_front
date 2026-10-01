import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentsTable from '../StudentsTable.vue'
import StudentStatusCell from '../StudentStatusCell.vue'
import { StudentStatus } from '../../enums/student-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { Student } from '../../interfaces/student.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

const columns: TableColumn[] = [
  { key: 'firstName', label: 'Ism' },
  { key: 'monthlyFee', label: 'Oylik' },
  { key: 'discount', label: 'Chegirma' },
  { key: 'status', label: 'Holat' },
]

// monthlyFee / discountPercent arrive from the backend as STRINGS.
const rows: Student[] = [
  {
    id: 1, firstName: 'Ali', lastName: 'Valiyev', phone: '1',
    status: StudentStatus.ACTIVE, monthlyFee: '500000', discountPercent: '10',
  },
  {
    id: 2, firstName: 'Vali', lastName: 'Aliyev', phone: '2',
    status: StudentStatus.NEW, monthlyFee: '600000',
    discountPeriods: [{ id: 1, fromMonth: '2026-01-01', percent: 15 }],
  },
  {
    id: 3, firstName: 'Guli', lastName: 'Karimova', phone: '3',
    status: StudentStatus.STOPPED, monthlyFee: '700000',
  },
]

const EDIT_BTN = 'button.hover\\:text-primary'

function mountTable(props: Record<string, unknown> = {}) {
  return mount(StudentsTable, { props: { columns, rows, ...props } })
}

// UiTable renders each row twice (desktop table + mobile card), so element
// counts are scoped to `tbody` — the desktop rendering.
describe('StudentsTable', () => {
  it('renders formatted money in a font-mono cell', () => {
    // Scope to the monthlyFee column (2nd) — the discount cell also uses font-mono.
    const feeCells = mountTable().findAll('tbody tr td:nth-child(2) span.font-mono')
    expect(feeCells).toHaveLength(3)
    expect(feeCells[0]!.text()).toBe(formatSom(500000))
  })

  it('renders the discount text for periods, single percent, and none', () => {
    const text = mountTable().text()
    expect(text).toContain('15%') // period
    expect(text).toContain('10%') // single percent
    expect(text).toContain('—') // none (row 3)
  })

  it('renders a status cell per row', () => {
    expect(mountTable().findAllComponents(StudentStatusCell)).toHaveLength(6)
  })

  it('shows the edit button only when canEdit and emits edit with the row', async () => {
    const wrapper = mountTable({ canEdit: true })
    const editButtons = wrapper.findAll(`tbody ${EDIT_BTN}`)
    expect(editButtons).toHaveLength(3)

    await editButtons[0]!.trigger('click')
    expect(last(wrapper.emitted('edit'))).toEqual([rows[0]])
  })

  it('hides the edit button when canEdit is false', () => {
    expect(mountTable({ canEdit: false }).findAll(EDIT_BTN)).toHaveLength(0)
  })

  it('always shows a view button per row (before edit) and emits open with the row', async () => {
    const wrapper = mountTable({ canEdit: false })
    const viewButtons = wrapper.findAll(
      `tbody button[aria-label="${t('students.view.title')}"]`,
    )
    expect(viewButtons).toHaveLength(3)

    await viewButtons[0]!.trigger('click')
    expect(last(wrapper.emitted('open'))).toEqual([rows[0]])
  })

  it('renders both the view and edit buttons per row when canEdit is true', () => {
    const wrapper = mountTable({ canEdit: true })
    expect(wrapper.findAll('tbody td:last-child button')).toHaveLength(6)
  })

  it('bubbles status-change with the student and the new status', () => {
    const wrapper = mountTable({ canEdit: true })
    wrapper.findAllComponents(StudentStatusCell)[0]!.vm.$emit('change', StudentStatus.STOPPED)
    expect(last(wrapper.emitted('status-change'))).toEqual([rows[0], StudentStatus.STOPPED])
  })

  it('shows the delete action only on rows the deletable predicate accepts', async () => {
    const deleteLabel = `tbody button[aria-label="${t('common.delete')}"]`
    expect(mountTable().findAll(deleteLabel)).toHaveLength(0)

    const wrapper = mountTable({ deletable: (s: Student) => s.status === StudentStatus.NEW })
    const buttons = wrapper.findAll(deleteLabel)
    expect(buttons).toHaveLength(1)
    await buttons[0]!.trigger('click')
    expect(last(wrapper.emitted('delete'))).toEqual([rows[1]])
  })
})
