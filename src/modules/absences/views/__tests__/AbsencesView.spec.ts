import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import AbsencesView from '../AbsencesView.vue'
import { fetchAbsences } from '../../api/absences.api'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { useUserStore } from '@/stores/user.store'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { Permission } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Absence } from '../../interfaces/absence.interface'
import { t } from '@/locales'

vi.mock('../../api/absences.api', () => ({
  fetchAbsences: vi.fn(),
  saveAbsenceFollowUp: vi.fn(),
}))
vi.mock('@/modules/groups/api/groups.api', () => ({
  fetchAllGroups: vi.fn(),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchTeachers: vi.fn(),
}))

function makeAbsence(overrides: Partial<Absence> = {}): Absence {
  return {
    id: 1,
    lessonDate: '2026-09-24',
    status: AttendanceStatus.ABSENT,
    comment: null,
    followUpNote: null,
    followedUpAt: null,
    followedUpBy: null,
    student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: '998901234567', secondPhone: null },
    group: { id: 3, name: 'English A1' },
    teacher: { id: 10, firstName: 'Olim', lastName: 'Karimov' },
    absencesInRange: 1,
    ...overrides,
  }
}

function setUser(permissions: string[]): void {
  useUserStore().user = {
    id: 1,
    email: 'reception@test.uz',
    role: UserRole.RECEPTION,
    roleId: 3,
    roleName: 'Reception',
    centerId: 1,
    permissions,
  }
}

describe('AbsencesView', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(fetchAbsences).mockResolvedValue({
      data: [makeAbsence()],
      meta: { total: 1, page: 1, perPage: 20, totalPages: 1 },
      summary: { absent: 4, excused: 2, notFollowedUp: 5 },
    })
    vi.mocked(fetchAllGroups).mockResolvedValue([])
    vi.mocked(fetchTeachers).mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('loads on mount and renders the title, summary and a table row', async () => {
    setUser([Permission.ATTENDANCE_MANAGE])
    const wrapper = mount(AbsencesView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(fetchAbsences).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain(t('absences.title'))
    expect(wrapper.text()).toContain(t('absences.summary.notFollowedUp'))

    const body = wrapper.get('tbody')
    expect(body.findAll('tr')).toHaveLength(1)
    expect(body.text()).toContain('Ali Valiyev')
    expect(body.text()).toContain(t('absences.table.record'))
  })

  it('hides the follow-up action without attendance.manage', async () => {
    setUser([])
    const wrapper = mount(AbsencesView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(wrapper.get('tbody').text()).toContain('Ali Valiyev')
    expect(wrapper.get('tbody').text()).not.toContain(t('absences.table.record'))
  })

  it('opens the follow-up modal when the row action is clicked', async () => {
    setUser([Permission.ATTENDANCE_MANAGE])
    const wrapper = mount(AbsencesView, { global: { plugins: [pinia] }, attachTo: document.body })
    await flushPromises()

    await wrapper.get('tbody').get('button').trigger('click')
    expect(document.body.textContent).toContain(t('absences.followUp.title'))
    wrapper.unmount()
  })
})
