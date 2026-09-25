import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
  changeLeadStatus,
  transferLeadToStudent,
} from '../leads.api'
import { http } from '@/shared/api/http'
import { LeadStatus } from '../../enums/lead-status.enum'
import type { Lead } from '../../interfaces/lead.interface'
import type { LeadForm } from '../../interfaces/lead-form.interface'
import type { LeadTransferForm } from '../../interfaces/lead-transfer-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const form: LeadForm = {
  firstName: 'Ali',
  lastName: 'Valiyev',
  phone: '+998901234567',
  centerId: 1,
  status: LeadStatus.NEW,
}

describe('leads.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchLeads GETs /leads with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, phone: '998900000000' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchLeads({
      centerId: 1,
      status: LeadStatus.NEW,
      groupId: 4,
      name: 'ali',
      phone: '998',
      followUpDate: '2026-09-10',
      page: 1,
      perPage: 10,
    })

    expect(mockedHttp.get).toHaveBeenCalledWith('/leads', {
      params: {
        centerId: 1,
        status: LeadStatus.NEW,
        groupId: 4,
        name: 'ali',
        phone: '998',
        followUpDate: '2026-09-10',
        page: 1,
        perPage: 10,
      },
    })
    expect(result).toEqual(body)
  })

  it('createLead POSTs the form to /leads and returns the created lead', async () => {
    const created = { id: 10, phone: '+998901234567' } as Lead
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createLead(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/leads', form)
    expect(result).toEqual(created)
  })

  it('updateLead PUTs the form to /leads/{id} and returns the updated lead', async () => {
    const updated = { id: 5, phone: '+998901234567' } as Lead
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateLead(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/leads/5', form)
    expect(result).toEqual(updated)
  })

  it('deleteLead DELETEs /leads/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteLead(7)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/leads/7')
  })

  it('changeLeadStatus PUTs /leads/change-status/{id} with { status, reason }', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await changeLeadStatus(3, LeadStatus.DISCARDED, 'Qiziqmadi')

    expect(mockedHttp.put).toHaveBeenCalledWith('/leads/change-status/3', {
      status: LeadStatus.DISCARDED,
      reason: 'Qiziqmadi',
    })
  })

  it('changeLeadStatus omits reason when not provided', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await changeLeadStatus(9, LeadStatus.CONVERTED)

    expect(mockedHttp.put).toHaveBeenCalledWith('/leads/change-status/9', {
      status: LeadStatus.CONVERTED,
    })
  })

  it('transferLeadToStudent POSTs the transfer body and returns the created student', async () => {
    const student = { id: 55 }
    mockedHttp.post.mockResolvedValueOnce({ data: student })

    const transfer: LeadTransferForm = {
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '+998901234567',
      status: LeadStatus.NEW,
      groupIds: [1, 2],
    }
    const result = await transferLeadToStudent(4, transfer)

    expect(mockedHttp.post).toHaveBeenCalledWith('/leads/4/transfer-to-student', transfer)
    expect(result).toEqual(student)
  })
})
