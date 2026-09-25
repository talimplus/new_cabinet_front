import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffOverviewHeader from '../StaffOverviewHeader.vue'
import type { StaffOverviewUser } from '../../interfaces/staff-overview.interface'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

// Deterministic stub for the real select (mirrors DashboardFilters.spec style).
const UiSelectStub = {
  name: 'UiSelect',
  props: ['modelValue', 'options', 'label', 'searchable', 'clearable'],
  emits: ['update:modelValue'],
  template: '<div class="ui-select-stub"></div>',
}

function makeUser(overrides: Partial<StaffOverviewUser> = {}): StaffOverviewUser {
  return {
    id: 1,
    firstName: 'Malika',
    lastName: 'Tosheva',
    phone: '+998901234567',
    login: 'malika',
    role: 'manager',
    roleName: null,
    centerId: 1,
    centerName: 'Chilonzor',
    salary: 2_000_000,
    commissionPercentage: 0,
    createdAt: '2026-01-01',
    ...overrides,
  }
}

function mountHeader(props: Record<string, unknown> = {}) {
  return mount(StaffOverviewHeader, {
    props: { user: makeUser(), month: '2026-09', ...props },
    global: { stubs: { UiSelect: UiSelectStub } },
  })
}

describe('StaffOverviewHeader', () => {
  it('shows initials from the first and last name', () => {
    const wrapper = mountHeader({ user: makeUser({ firstName: 'Malika', lastName: 'Tosheva' }) })
    expect(wrapper.text()).toContain('MT')
  })

  it('joins roleName · centerName · phone in the subtitle', () => {
    const wrapper = mountHeader({
      user: makeUser({ roleName: 'Kassir', role: 'manager', centerName: 'Chilonzor', phone: '+998901234567' }),
    })
    expect(wrapper.text()).toContain('Kassir · Chilonzor · +998901234567')
  })

  it('falls back to role when roleName is absent, and skips blank fields', () => {
    const wrapper = mountHeader({
      user: makeUser({ roleName: null, role: 'manager', centerName: null, phone: '' }),
    })
    expect(wrapper.text()).toContain('manager')
    expect(wrapper.text()).not.toContain('· ·')
  })

  it('emits update:month when the month select changes', async () => {
    const wrapper = mountHeader()
    wrapper.findComponent({ name: 'UiSelect' }).vm.$emit('update:modelValue', '2026-03')
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:month') ?? [])).toEqual(['2026-03'])
  })
})
