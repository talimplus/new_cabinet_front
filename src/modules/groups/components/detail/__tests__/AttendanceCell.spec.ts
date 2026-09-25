import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AttendanceCell from '../AttendanceCell.vue'
import { AttendanceStatus } from '../../../enums/attendance-status.enum'

function mountCell(props: Record<string, unknown> = {}) {
  return mount(AttendanceCell, { props: { status: null, ...props } })
}

describe('AttendanceCell', () => {
  it('tints the icon with the status color token', () => {
    expect(mountCell({ status: AttendanceStatus.PRESENT }).html()).toContain('text-success')
    expect(mountCell({ status: AttendanceStatus.ABSENT }).html()).toContain('text-danger')
    expect(mountCell({ status: AttendanceStatus.LATE }).html()).toContain('text-warning')
    expect(mountCell({ status: AttendanceStatus.EXCUSED }).html()).toContain('text-info')
  })

  it('renders a muted placeholder when there is no status', () => {
    expect(mountCell({ status: null }).html()).toContain('text-fg-subtle')
  })

  it('emits click when editable and the cell is clicked', async () => {
    const wrapper = mountCell({ status: AttendanceStatus.PRESENT, editable: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when the cell is locked', async () => {
    const wrapper = mountCell({ status: AttendanceStatus.PRESENT, editable: false })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('shows a comment dot and title when a comment is present', () => {
    const wrapper = mountCell({ status: AttendanceStatus.LATE, comment: 'kechikdi' })
    expect(wrapper.find('span.rounded-full').exists()).toBe(true)
    expect(wrapper.find('[title="kechikdi"]').exists()).toBe(true)
  })

  it('renders a dash icon for an outside-enrollment cell with no status', () => {
    const wrapper = mountCell({ status: null, outside: true })
    expect(wrapper.html()).toContain('lucide-minus')
  })

  it('does not render the dash icon for an in-window cell with no status', () => {
    const wrapper = mountCell({ status: null, outside: false })
    expect(wrapper.html()).not.toContain('lucide-minus')
    expect(wrapper.html()).toContain('lucide-circle-alert')
  })

  it('prefers note over comment for the hover title', () => {
    const wrapper = mountCell({
      status: AttendanceStatus.LATE,
      comment: 'kechikdi',
      note: "Guruhga keyin qo'shilgan",
    })
    expect(wrapper.find("[title=\"Guruhga keyin qo'shilgan\"]").exists()).toBe(true)
    expect(wrapper.find('[title="kechikdi"]').exists()).toBe(false)
  })

  it('does not emit click for an outside-window cell (not editable)', async () => {
    const wrapper = mountCell({ status: null, outside: true, editable: false })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
