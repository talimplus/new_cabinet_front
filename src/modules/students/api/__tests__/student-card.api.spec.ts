import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '@/shared/api/http'
import {
  fetchStudentPaymentSummary,
  payStudentDebt,
  fetchStudentTelegramLink,
  regenerateStudentTelegramQr,
  unlinkTelegramParent,
} from '../student-card.api'
import { StudentStatus } from '../../enums/student-status.enum'
import { StudentPreferredTime } from '../../enums/student-preferred-time.enum'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { StudentPaymentSummary } from '../../interfaces/student-summary.interface'
import type { PayDebtForm } from '../../interfaces/pay-debt.interface'
import type { TelegramStudentLink } from '../../interfaces/telegram-link.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'
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

const summary: StudentPaymentSummary = {
  student: {
    id: 29,
    firstName: 'TestEdited',
    lastName: 'Claude',
    phone: '+998960533321',
    preferredTime: StudentPreferredTime.EVENING,
    preferredDays: [WeekDay.MONDAY],
    studyDays: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
    status: StudentStatus.ACTIVE,
    monthlyFee: 500000,
    discountPercent: 10,
    discountReason: 'aka',
    centerId: 4,
    centerName: 'Markaz 1',
    subject: null,
    groups: [
      {
        id: 14,
        name: 'Guruh 266227',
        monthlyFee: 500000,
        days: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
        schedule: [{ day: WeekDay.MONDAY, startTime: '10:00:00' }],
      },
    ],
  },
  totals: {
    totalDue: 138461.54,
    totalPaid: 107000,
    totalDebt: 31461.54,
    totalPending: 1200,
    totalReceived: 108200,
    payableNow: 30261.54,
  },
  months: [
    {
      paymentId: 855,
      forMonth: '2026-09',
      groupId: 14,
      groupName: 'Guruh 266227',
      amountDue: 138461.54,
      amountPaid: 107000,
      pendingAmount: 1200,
      receivedAmount: 108200,
      remaining: 31461.54,
      payableNow: 30261.54,
      status: PaymentStatus.PARTIAL,
      lessonsPlanned: 13,
      lessonsBillable: 4,
      lessonsExcused: 0,
      effectiveBillable: 4,
      fullAmount: 450000,
      perLessonAmount: 34615.38,
      isProrated: true,
      manualExcludedAmount: 0,
      manualExcludedLessons: null,
      manualExcludedReason: null,
    },
  ],
}

describe('student-card.api', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('fetchStudentPaymentSummary', () => {
    it('GETs /payments/student/{id}/summary and returns the body', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: summary })

      const result = await fetchStudentPaymentSummary(29)

      expect(mockedHttp.get).toHaveBeenCalledWith('/payments/student/29/summary')
      expect(result).toEqual(summary)
    })
  })

  describe('payStudentDebt', () => {
    it('PUTs /payments/pay-debt/student/{id} with the body and returns the refreshed summary', async () => {
      const body: PayDebtForm = {
        amount: 30261.54,
        comment: 'Naqd to‘landi',
        paymentMethod: PaymentMethod.CASH,
        paidAt: '2026-09-24',
      }
      mockedHttp.put.mockResolvedValueOnce({ data: summary })

      const result = await payStudentDebt(29, body)

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/pay-debt/student/29', body)
      expect(result).toEqual(summary)
    })

    it('returns checks[] appended to the refreshed summary', async () => {
      const check: PaymentCheck = {
        receiptId: 501,
        checkNo: '1',
        status: ReceiptStatus.CONFIRMED,
        student: { fullName: 'TestEdited Claude', phone: '+998960533321' },
        group: { name: 'Guruh 266227' },
        teacher: null,
        forMonth: '2026-09',
        amount: 30261.54,
        paymentMethod: PaymentMethod.CASH,
        receivedBy: { fullName: 'Admin Adminov' },
      }
      const summaryWithChecks: StudentPaymentSummary = { ...summary, checks: [check] }
      mockedHttp.put.mockResolvedValueOnce({ data: summaryWithChecks })

      const result = await payStudentDebt(29, {})

      expect(result.checks).toEqual([check])
    })
  })

  describe('fetchStudentTelegramLink', () => {
    it('GETs /telegram/students/{id}/link — unconfigured bot, no parents', async () => {
      const link: TelegramStudentLink = {
        studentId: 29,
        botUsername: null,
        botConfigured: false,
        deepLink: null,
        qrDataUrl: null,
        parents: [],
      }
      mockedHttp.get.mockResolvedValueOnce({ data: link })

      const result = await fetchStudentTelegramLink(29)

      expect(mockedHttp.get).toHaveBeenCalledWith('/telegram/students/29/link')
      expect(result).toEqual(link)
    })

    it('GETs /telegram/students/{id}/link — configured bot with one linked parent', async () => {
      const link: TelegramStudentLink = {
        studentId: 29,
        botUsername: 'talimplus_bot',
        botConfigured: true,
        deepLink: 'https://t.me/talimplus_bot?start=abc',
        qrDataUrl: 'data:image/png;base64,abc123',
        parents: [
          {
            id: 3,
            firstName: 'Ona',
            lastName: null,
            username: 'onam',
            isActive: true,
            linkedAt: '2026-09-01T10:00:00.000Z',
            unlinkedAt: null,
            blockedAt: null,
            lastNotifiedAt: null,
          },
        ],
      }
      mockedHttp.get.mockResolvedValueOnce({ data: link })

      const result = await fetchStudentTelegramLink(29)

      expect(mockedHttp.get).toHaveBeenCalledWith('/telegram/students/29/link')
      expect(result).toEqual(link)
    })
  })

  describe('regenerateStudentTelegramQr', () => {
    it('POSTs …/link/regenerate with no body and returns the new link', async () => {
      const link: TelegramStudentLink = {
        studentId: 29,
        botUsername: 'talimplus_bot',
        botConfigured: true,
        deepLink: 'https://t.me/talimplus_bot?start=new',
        qrDataUrl: 'data:image/png;base64,new123',
        parents: [],
      }
      mockedHttp.post.mockResolvedValueOnce({ data: link })

      const result = await regenerateStudentTelegramQr(29)

      expect(mockedHttp.post).toHaveBeenCalledWith('/telegram/students/29/link/regenerate')
      expect(mockedHttp.post).toHaveBeenCalledTimes(1)
      expect(mockedHttp.post.mock.calls[0]).toHaveLength(1)
      expect(result).toEqual(link)
    })
  })

  describe('unlinkTelegramParent', () => {
    it('DELETEs /telegram/parents/{linkId}', async () => {
      mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

      await unlinkTelegramParent(3)

      expect(mockedHttp.delete).toHaveBeenCalledWith('/telegram/parents/3')
    })
  })
})
