import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useLeads } from '../use-leads'
import {
  fetchLeads as fetchLeadsApi,
  createLead as createLeadApi,
  updateLead as updateLeadApi,
  deleteLead as deleteLeadApi,
  changeLeadStatus as changeLeadStatusApi,
  transferLeadToStudent as transferLeadToStudentApi,
} from '../../api/leads.api'
import { fetchAllGroups as fetchAllGroupsApi } from '@/modules/groups/api/groups.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { LeadStatus } from '../../enums/lead-status.enum'
import type { Lead } from '../../interfaces/lead.interface'

vi.mock('../../api/leads.api', () => ({
  fetchLeads: vi.fn(),
  createLead: vi.fn(),
  updateLead: vi.fn(),
  deleteLead: vi.fn(),
  changeLeadStatus: vi.fn(),
  transferLeadToStudent: vi.fn(),
}))
vi.mock('@/modules/groups/api/groups.api', () => ({
  fetchAllGroups: vi.fn(),
}))

const mockedFetchLeads = vi.mocked(fetchLeadsApi)
const mockedCreateLead = vi.mocked(createLeadApi)
const mockedUpdateLead = vi.mocked(updateLeadApi)
const mockedDeleteLead = vi.mocked(deleteLeadApi)
const mockedChangeStatus = vi.mocked(changeLeadStatusApi)
const mockedTransfer = vi.mocked(transferLeadToStudentApi)
const mockedFetchAllGroups = vi.mocked(fetchAllGroupsApi)


function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 1,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '998901112233',
    status: LeadStatus.NEW,
    ...overrides,
  }
}

describe('useLeads', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchLeads.mockResolvedValue({
      data: [makeLead()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 4 },
    })
    mockedFetchAllGroups.mockResolvedValue([])
    mockedChangeStatus.mockResolvedValue(undefined)
  })

  describe('load()', () => {

    it('builds params from filters + center and strips empty values', async () => {
      const s = useLeads()
      s.applyFilters()
      await flushPromises()

      expect(mockedFetchLeads).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        name: undefined,
        phone: undefined,
        status: undefined,
        groupId: undefined,
        followUpDate: undefined,
      })
      expect(s.rows.value).toHaveLength(1)
      expect(s.totalPages.value).toBe(4)
    })

    it('passes non-empty filters through', async () => {
      const s = useLeads()
      s.filters.name = 'ali'
      s.filters.status = LeadStatus.NEW
      s.filters.groupId = 3
      await s.setPage(2)
      await flushPromises()

      expect(mockedFetchLeads).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
          name: 'ali',
          status: LeadStatus.NEW,
          groupId: 3,
        }),
      )
    })
  })

  describe('submit()', () => {
    it('creates a lead (forcing status NEW) when not editing, then notifies + closes', async () => {
      const s = useLeads()
      s.openCreate()
      mockedCreateLead.mockResolvedValueOnce(makeLead({ id: 99 }))

      await s.submit({ phone: '998901112233', firstName: 'Ali' })
      await flushPromises()

      expect(mockedCreateLead).toHaveBeenCalledWith({
        phone: '998901112233',
        firstName: 'Ali',
        status: LeadStatus.NEW,
      })
      expect(mockedUpdateLead).not.toHaveBeenCalled()
      expect(s.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing lead with the given payload', async () => {
      const s = useLeads()
      const editing = makeLead({ id: 42 })
      s.openEdit(editing)
      mockedUpdateLead.mockResolvedValueOnce(editing)

      await s.submit({ phone: '998901112233', firstName: 'Ali' })
      await flushPromises()

      expect(mockedCreateLead).not.toHaveBeenCalled()
      expect(mockedUpdateLead).toHaveBeenCalledWith(42, {
        phone: '998901112233',
        firstName: 'Ali',
      })
    })
  })

  describe('remove()', () => {
    it('deletes after confirmation and reloads', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockedDeleteLead.mockResolvedValueOnce(undefined)
      const s = useLeads()

      await s.remove(7)
      await flushPromises()

      expect(mockedDeleteLead).toHaveBeenCalledWith(7)
    })

    it('does nothing when the confirmation is cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const s = useLeads()

      await s.remove(7)

      expect(mockedDeleteLead).not.toHaveBeenCalled()
    })
  })

  describe('requestStatus()', () => {
    it('opens the discard dialog for DISCARDED instead of calling the api', () => {
      const s = useLeads()
      const lead = makeLead()

      s.requestStatus(lead, LeadStatus.DISCARDED)

      expect(mockedChangeStatus).not.toHaveBeenCalled()
      expect(s.discardDialog.open).toBe(true)
      expect(s.discardDialog.lead).toEqual(lead)
    })

    it('applies a non-discard status immediately', async () => {
      const s = useLeads()
      const lead = makeLead()

      s.requestStatus(lead, LeadStatus.CONVERTED)
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(lead.id, LeadStatus.CONVERTED, undefined)
    })
  })

  describe('confirmDiscard()', () => {
    it('changes the status to DISCARDED with the reason and closes the dialog', async () => {
      const s = useLeads()
      const lead = makeLead()
      s.requestStatus(lead, LeadStatus.DISCARDED)

      await s.confirmDiscard('Qiziqmadi')
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(lead.id, LeadStatus.DISCARDED, 'Qiziqmadi')
      expect(s.discardDialog.open).toBe(false)
    })
  })

  describe('transferToStudent()', () => {
    it('transfers the editing lead, notifies and closes the modal', async () => {
      const s = useLeads()
      const editing = makeLead({ id: 12 })
      s.openEdit(editing)
      mockedTransfer.mockResolvedValueOnce({ id: 77 })

      await s.transferToStudent({
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
        groupIds: [],
      })
      await flushPromises()

      expect(mockedTransfer).toHaveBeenCalledWith(12, {
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
        groupIds: [],
      })
      expect(s.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })
  })
})
