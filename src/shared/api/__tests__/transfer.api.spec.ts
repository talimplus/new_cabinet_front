import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '@/shared/api/http'
import { previewTransfer, transferStudents } from '../transfer.api'
import type {
  TransferForm,
  TransferPreviewRow,
  TransferResponse,
} from '@/shared/interfaces/student-transfer.interface'
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

describe('transfer.api', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('previewTransfer', () => {
    it('POSTs /students/transfer/preview and returns the bare array', async () => {
      const rows: TransferPreviewRow[] = [
        { studentId: 29, firstName: 'TestEdited', lastName: 'Claude', debt: 31461.54, overpaid: 0 },
      ]
      mockedHttp.post.mockResolvedValueOnce({ data: rows })

      const result = await previewTransfer({ studentIds: [29], fromGroupId: 14 })

      expect(mockedHttp.post).toHaveBeenCalledWith('/students/transfer/preview', {
        studentIds: [29],
        fromGroupId: 14,
      })
      expect(result).toEqual(rows)
    })

    it('falls back to an empty array when the backend does not answer with an array', async () => {
      // Defensive branch in previewTransfer — documents the guard against a
      // malformed (non-array) response body.
      mockedHttp.post.mockResolvedValueOnce({ data: null })

      const result = await previewTransfer({ studentIds: [29], fromGroupId: 14 })

      expect(result).toEqual([])
    })
  })

  describe('transferStudents', () => {
    const response: TransferResponse = {
      fromGroupId: 14,
      toGroupId: 15,
      transferDate: '2026-09-24',
      sourceGroupClosed: false,
      transferred: 1,
      results: [
        {
          studentId: 29,
          firstName: 'TestEdited',
          lastName: 'Claude',
          carriedOverAmount: 0,
          refundedAmount: 0,
          remainingDebtInSourceGroup: 31461.54,
        },
      ],
    }

    it('POSTs /students/transfer with the full form (optional fields present)', async () => {
      const form: TransferForm = {
        studentIds: [29],
        fromGroupId: 14,
        toGroupId: 15,
        transferDate: '2026-09-24',
        reason: 'Vaqt jadvali mos kelmadi',
        closeSourceGroup: true,
      }
      mockedHttp.post.mockResolvedValueOnce({ data: response })

      const result = await transferStudents(form)

      expect(mockedHttp.post).toHaveBeenCalledWith('/students/transfer', form)
      expect(result).toEqual(response)
    })

    it('POSTs /students/transfer with only the required fields', async () => {
      const form: TransferForm = { studentIds: [29], fromGroupId: 14, toGroupId: 15 }
      mockedHttp.post.mockResolvedValueOnce({ data: response })

      const result = await transferStudents(form)

      expect(mockedHttp.post).toHaveBeenCalledWith('/students/transfer', form)
      expect(result).toEqual(response)
    })
  })
})
