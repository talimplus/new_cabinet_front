import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h } from 'vue'
import StaffGroupsCard from '../StaffGroupsCard.vue'
import { useUserStore } from '@/stores/user.store'
import { UserRole } from '@/shared/enums/user-role.enum'
import { Permission } from '@/shared/enums/permission.enum'
import { GroupStatus, GROUP_STATUS_LABEL_KEYS } from '@/modules/groups/enums/group-status.enum'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { t } from '@/locales'
import type { StaffTeacherGroup } from '../../interfaces/staff-overview.interface'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { render: () => h('div') } },
    { path: '/groups/:id', name: 'group-detail', component: { render: () => h('div') } },
  ],
})

const groups: StaffTeacherGroup[] = [
  {
    id: 5, name: 'IELTS 1', status: GroupStatus.STARTED, subject: 'Ingliz tili', room: '3-xona',
    studentsCount: 9, startDate: '2026-07-02', endDate: null,
    schedules: [
      { day: WeekDay.TUESDAY, startTime: '14:00' },
      { day: WeekDay.THURSDAY, startTime: '14:00' },
      { day: WeekDay.SATURDAY, startTime: '10:00' },
    ],
  },
  {
    id: 6, name: 'Kids A', status: GroupStatus.NEW, subject: null, room: null,
    studentsCount: 3, startDate: null, endDate: null, schedules: [],
  },
]

function signIn(permissions: string[]) {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role: UserRole.MANAGER, roleId: 1,
    roleName: 'Manager', centerId: null, permissions,
  }
}

const mountCard = (list: StaffTeacherGroup[]) =>
  mount(StaffGroupsCard, { props: { groups: list }, global: { plugins: [router] } })

describe('StaffGroupsCard', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows the group count and the total number of students', () => {
    signIn([])
    const text = mountCard(groups).text()
    expect(text).toContain(`${t('staff.groups.title')} (2)`)
    expect(text).toContain(t('staff.groups.totalStudents', { count: 12 }))
  })

  it('renders a row per group with subject, joined schedule, room and status', () => {
    signIn([])
    const rows = mountCard(groups).findAll('tbody tr')
    expect(rows).toHaveLength(2)
    const first = rows[0]!.text()
    const days = [WeekDay.TUESDAY, WeekDay.THURSDAY].map((d) => t(`common.weekDaysShort.${d}`)).join(', ')
    expect(first).toContain('Ingliz tili')
    expect(first).toContain(`${days} 14:00; ${t('common.weekDaysShort.saturday')} 10:00`)
    expect(first).toContain('3-xona')
    expect(first).toContain(t(GROUP_STATUS_LABEL_KEYS[GroupStatus.STARTED]))
    expect(rows[1]!.text()).toContain(t(GROUP_STATUS_LABEL_KEYS[GroupStatus.NEW]))
  })

  it('links group names to the group page only with groups.view', () => {
    signIn([Permission.GROUPS_VIEW])
    const links = mountCard(groups).findAll('tbody a')
    expect(links.map((a) => a.text())).toEqual(['IELTS 1', 'Kids A'])
    expect(links[0]!.attributes('href')).toBe('/groups/5')

    signIn([])
    expect(mountCard(groups).findAll('tbody a')).toHaveLength(0)
  })

  it('shows the empty text when the teacher has no groups', () => {
    signIn([])
    const wrapper = mountCard([])
    expect(wrapper.text()).toContain(t('staff.empty.groups'))
    expect(wrapper.text()).not.toContain(t('staff.groups.totalStudents', { count: 0 }))
  })
})
