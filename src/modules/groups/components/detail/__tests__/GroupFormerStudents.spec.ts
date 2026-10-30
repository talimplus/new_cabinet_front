import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import GroupFormerStudents from '../GroupFormerStudents.vue'
import { fetchGroupMembers } from '../../../api/groups.api'
import { StudentStatus } from '@/modules/students/enums/student-status.enum'
import { t } from '@/locales'

vi.mock('../../../api/groups.api', () => ({ fetchGroupMembers: vi.fn() }))
const mockedFetch = vi.mocked(fetchGroupMembers)

const member = (over: Record<string, unknown>) => ({
  studentId: 1, firstName: 'Ali', lastName: 'Valiyev', phone: null, studentStatus: StudentStatus.ACTIVE,
  joinedAt: '2026-09-01', leftAt: null, leftReason: null, transferredToGroupId: null,
  transferredToGroupName: null, isCurrent: true, debt: 0, ...over,
})

const mountIt = () => mount(GroupFormerStudents, { props: { groupId: 4 }, global: { stubs: { RouterLink: RouterLinkStub } } })

describe('GroupFormerStudents', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists only former members with period, transfer target and debt', async () => {
    mockedFetch.mockResolvedValue([
      member({}),
      member({ studentId: 2, firstName: 'Vali', isCurrent: false, leftAt: '2026-10-20', transferredToGroupName: 'B2', debt: 200000 }),
    ])
    const w = mountIt()
    await flushPromises()
    expect(mockedFetch).toHaveBeenCalledWith(4)
    const text = w.text()
    expect(text).toContain(t('groups.formerStudents.title', { count: 1 }))
    expect(text).toContain('Vali')
    expect(text).not.toContain('Valiyev Ali') // still in the group — not former
    expect(text).toContain(t('groups.formerStudents.transferredTo', { name: 'B2' }))
    expect(text).toContain('20.10.2026')
  })

  it('renders nothing when nobody left, and hides debt without payments.view', async () => {
    mockedFetch.mockResolvedValue([member({})])
    const w = mountIt()
    await flushPromises()
    expect(w.text()).toBe('')

    mockedFetch.mockResolvedValue([member({ isCurrent: false, leftAt: '2026-10-20', debt: null })])
    const w2 = mountIt()
    await flushPromises()
    expect(w2.text()).not.toContain(t('groups.formerStudents.noDebt'))
  })
})
