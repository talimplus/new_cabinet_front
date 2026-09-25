import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import StudentStatusCell from '../StudentStatusCell.vue'
import { UiDropdown, UiSpinner } from '@/shared/components'
import {
  StudentStatus,
  STUDENT_STATUS_LABEL_KEYS,
} from '../../enums/student-status.enum'
import { t } from '@/locales'

describe('StudentStatusCell', () => {
  it('renders the allowed transitions and emits change with the chosen status', async () => {
    const wrapper = mount(StudentStatusCell, {
      props: { status: StudentStatus.NEW, canEdit: true },
    })

    // Editable → shows a dropdown trigger, not a plain badge.
    expect(wrapper.findComponent(UiDropdown).exists()).toBe(true)

    // Open the dropdown to reveal the transition items.
    await wrapper.find('button').trigger('click')
    await nextTick()

    const items = wrapper.findAll('[role="menuitem"]')
    // NEW → [ACTIVE, IGNORED]
    expect(items).toHaveLength(2)
    expect(items[0]!.text()).toBe(t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.ACTIVE]))
    expect(items[1]!.text()).toBe(t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.IGNORED]))

    await items[0]!.trigger('click')
    const changes = wrapper.emitted('change') ?? []
    expect(changes[changes.length - 1]).toEqual([StudentStatus.ACTIVE])
  })

  it('renders a plain badge with no dropdown when canEdit is false', () => {
    const wrapper = mount(StudentStatusCell, {
      props: { status: StudentStatus.NEW, canEdit: false },
    })

    expect(wrapper.findComponent(UiDropdown).exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[role="menuitem"]').exists()).toBe(false)
    expect(wrapper.text()).toContain(t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.NEW]))
  })

  it('shows a spinner while loading', () => {
    const wrapper = mount(StudentStatusCell, {
      props: { status: StudentStatus.ACTIVE, canEdit: true, loading: true },
    })

    expect(wrapper.findComponent(UiSpinner).exists()).toBe(true)
    expect(wrapper.findComponent(UiDropdown).exists()).toBe(false)
  })
})
