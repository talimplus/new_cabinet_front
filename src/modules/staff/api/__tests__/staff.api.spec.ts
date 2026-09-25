import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '@/shared/api/http'
import {
  fetchStaffOverview,
  fetchMyOverview,
  fetchStaffDeductions,
  createStaffDeduction,
  deleteStaffDeduction,
} from '../staff.api'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { PayrollStatus } from '@/modules/payroll/enums/payroll-status.enum'
import { StaffDeductionType } from '../../enums/staff-deduction-type.enum'
import type { StaffOverview, StaffDeductionRow, StaffDeductionForm } from '../../interfaces/staff-overview.interface'

import type { AxiosInstance } from 'axios'

type Http = AxiosInstance

vi.mock('@/shared/api/http', () => ({
  http: {
    get: vi.fn<Http['get']>(),
    post: vi.fn<Http['post']>(),
    put: vi.fn<Http['put']>(),
    delete: vi.fn<Http['delete']>(),
  },
}))

const mockedHttp = vi.mocked(http, true)

const overview: StaffOverview = {
  user: {
    id: 50,
    firstName: 'Perm',
    lastName: 'reception',
    phone: '+998907092816',
    login: 'perm.reception@test.uz',
    role: 'reception',
    roleName: 'Qabulxona',
    centerId: 4,
    centerName: 'Markaz 1',
    salary: 3000000,
    commissionPercentage: 0,
    createdAt: '2026-08-01T04:00:00.000Z',
  },
  forMonth: '2026-09-01',
  summary: {
    expectedDays: 0,
    attendedDays: 0,
    missedDays: 0,
    lateDays: 0,
    totalLateMinutes: 0,
    flaggedDays: 0,
    unsettledCount: 2,
    unsettledAmount: 1200,
    rejectedCount: 1,
    rejectedAmount: 1500,
    deductionThisMonth: 0,
    deductionOutstanding: 0,
  },
  months: [],
  lateRecords: [],
  attendanceRecords: [],
  unsettledReceipts: [
    {
      id: 55,
      amount: 700,
      status: ReceiptStatus.PENDING,
      paymentMethod: PaymentMethod.CASH,
      checkNo: '1-A-B-C-D-E-F',
      transactionNo: 'TRX-20260924-000055',
      receivedAt: '2026-09-24T07:03:44.646Z',
      comment: null,
      student: { id: 29, firstName: 'TestEdited', lastName: 'Claude' },
      group: { id: 14, name: 'Guruh 266227' },
      forMonth: '2026-09-01',
    },
  ],
  deductions: [],
  salary: {
    id: 70,
    forMonth: '2026-09-01',
    baseSalary: 3000000,
    deductionAmount: 0,
    netSalary: 3000000,
    paidAmount: 0,
    remaining: 3000000,
    status: PayrollStatus.UNPAID,
    appliedDeductions: [],
  },
}

const deductionRow: StaffDeductionRow = {
  id: 7,
  userId: 50,
  amount: 100000,
  appliedAmount: 0,
  remainingAmount: 100000,
  type: StaffDeductionType.LATE,
  reason: 'Kechikish',
  sourceForMonth: '2026-09',
  settledAt: null,
  createdAt: '2026-09-20T00:00:00.000Z',
  createdBy: { id: 1, firstName: 'Admin', lastName: 'Adminov' },
}

describe('staff.api', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('fetchStaffOverview', () => {
    it('gets the userId overview with the forMonth param', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: overview })

      await expect(fetchStaffOverview(50, '2026-09')).resolves.toEqual(overview)
      expect(mockedHttp.get).toHaveBeenCalledWith('/staff/50/overview', {
        params: { forMonth: '2026-09' },
      })
    })

    it('sends undefined params when forMonth is omitted', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: overview })

      await fetchStaffOverview(50)
      expect(mockedHttp.get).toHaveBeenCalledWith('/staff/50/overview', { params: undefined })
    })
  })

  describe('fetchMyOverview', () => {
    it('gets the own overview with the forMonth param', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: overview })

      await expect(fetchMyOverview('2026-09')).resolves.toEqual(overview)
      expect(mockedHttp.get).toHaveBeenCalledWith('/staff/me/overview', {
        params: { forMonth: '2026-09' },
      })
    })

    it('sends undefined params when forMonth is omitted', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: overview })

      await fetchMyOverview()
      expect(mockedHttp.get).toHaveBeenCalledWith('/staff/me/overview', { params: undefined })
    })
  })

  describe('fetchStaffDeductions', () => {
    it('returns the bare array body', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: [deductionRow] })

      await expect(fetchStaffDeductions(50)).resolves.toEqual([deductionRow])
      expect(mockedHttp.get).toHaveBeenCalledWith('/staff/50/deductions')
    })

    it('defends against a non-array body', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: null })

      await expect(fetchStaffDeductions(50)).resolves.toEqual([])
    })
  })

  describe('createStaffDeduction', () => {
    it('posts the form and returns the created row', async () => {
      const form: StaffDeductionForm = {
        userId: 50,
        amount: 100000,
        reason: 'Kechikish',
        type: StaffDeductionType.LATE,
        forMonth: '2026-09',
      }
      mockedHttp.post.mockResolvedValueOnce({ data: deductionRow })

      await expect(createStaffDeduction(form)).resolves.toEqual(deductionRow)
      expect(mockedHttp.post).toHaveBeenCalledWith('/staff/deductions', form)
    })
  })

  describe('deleteStaffDeduction', () => {
    it('deletes by id', async () => {
      mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

      await deleteStaffDeduction(7)
      expect(mockedHttp.delete).toHaveBeenCalledWith('/staff/deductions/7')
    })
  })
})
