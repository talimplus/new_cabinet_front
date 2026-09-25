import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStudentTransfer } from '../use-student-transfer'
import type { TransferGroupOption } from '../use-student-transfer'
import { previewTransfer as previewTransferApi, transferStudents as transferStudentsApi } from '@/shared/api/transfer.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { t } from '@/locales'
import type { TransferPreviewRow, TransferResponse } from '@/shared/interfaces/student-transfer.interface'

vi.mock('@/shared/api/transfer.api', () => ({
  previewTransfer: vi.fn(),
  transferStudents: vi.fn(),
}))

const mockedPreview = vi.mocked(previewTransferApi)
const mockedTransfer = vi.mocked(transferStudentsApi)

const DEFAULT_GROUPS: TransferGroupOption[] = [
  { id: 1, name: 'Source' },
  { id: 2, name: 'Dest' },
]

/** The composable now takes its group loader injected, so tests supply one. */
function makeTransfer(
  ids: number[],
  onDone: () => void = vi.fn(),
  groups: TransferGroupOption[] = DEFAULT_GROUPS,
) {
  return useStudentTransfer(() => ids, onDone, () => Promise.resolve(groups))
}

function makeRow(overrides: Partial<TransferPreviewRow> = {}): TransferPreviewRow {
  return { studentId: 1, firstName: 'Ali', lastName: 'Valiyev', debt: 0, overpaid: 0, ...overrides }
}

function makeTransferResponse(overrides: Partial<TransferResponse> = {}): TransferResponse {
  return {
    fromGroupId: 1,
    toGroupId: 2,
    transferDate: '2026-09-24',
    sourceGroupClosed: false,
    transferred: 1,
    results: [],
    ...overrides,
  }
}

describe('useStudentTransfer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedPreview.mockResolvedValue([])
    mockedTransfer.mockResolvedValue(makeTransferResponse())
  })

  describe('open()', () => {
    it('resets the form, loads group options excluding the source group, stores the preview rows', async () => {
      mockedPreview.mockResolvedValueOnce([makeRow({ debt: 100, overpaid: 0 })])
      const s = makeTransfer([1])

      await s.open(1, 'Source')

      expect(s.state.open).toBe(true)
      expect(s.state.fromGroupId).toBe(1)
      expect(s.state.fromGroupName).toBe('Source')
      expect(s.state.toGroupId).toBeNull()
      expect(s.state.date).toBeNull()
      expect(s.state.reason).toBe('')
      expect(s.state.closeSourceGroup).toBe(false)
      expect(s.state.previewing).toBe(false)
      expect(mockedPreview).toHaveBeenCalledWith({ studentIds: [1], fromGroupId: 1 })
      expect(s.groupOptions.value).toEqual([{ label: 'Dest', value: 2 }])
      expect(s.rows.value).toEqual([makeRow({ debt: 100, overpaid: 0 })])
    })
  })

  describe('totalDebt / totalOverpaid', () => {
    it('sum the preview rows', async () => {
      mockedPreview.mockResolvedValueOnce([
        makeRow({ studentId: 1, debt: 100, overpaid: 20 }),
        makeRow({ studentId: 2, debt: 50, overpaid: 0 }),
      ])
      const s = makeTransfer([1, 2])

      await s.open(1, 'Source')

      expect(s.totalDebt.value).toBe(150)
      expect(s.totalOverpaid.value).toBe(20)
    })
  })

  describe('valid', () => {
    it('is false with no destination', async () => {
      const s = makeTransfer([1])
      await s.open(1, 'Source')

      expect(s.valid.value).toBe(false)
    })

    it('is false when the destination equals the source', async () => {
      const s = makeTransfer([1])
      await s.open(1, 'Source')
      s.state.toGroupId = 1

      expect(s.valid.value).toBe(false)
    })

    it('is true with a different destination', async () => {
      const s = makeTransfer([1])
      await s.open(1, 'Source')
      s.state.toGroupId = 2

      expect(s.valid.value).toBe(true)
    })
  })

  describe('submit()', () => {
    it('sends the full payload, omitting empty transferDate/reason/closeSourceGroup', async () => {
      const onDone = vi.fn<() => void>()
      const s = makeTransfer([1, 2], onDone)
      await s.open(1, 'Source')
      s.state.toGroupId = 2

      await s.submit()

      expect(mockedTransfer).toHaveBeenCalledWith({
        studentIds: [1, 2],
        fromGroupId: 1,
        toGroupId: 2,
        transferDate: undefined,
        reason: undefined,
        closeSourceGroup: undefined,
      })
      expect(s.state.open).toBe(false)
      expect(onDone).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('students.transfer.done', { count: 1 }),
        }),
      )
    })

    it('sends transferDate/reason/closeSourceGroup when set', async () => {
      const s = makeTransfer([1])
      await s.open(1, 'Source')
      s.state.toGroupId = 2
      s.state.date = new Date(2026, 8, 24)
      s.state.reason = '  moving up  '
      s.state.closeSourceGroup = true

      await s.submit()

      expect(mockedTransfer).toHaveBeenCalledWith({
        studentIds: [1],
        fromGroupId: 1,
        toGroupId: 2,
        transferDate: '2026-09-24',
        reason: 'moving up',
        closeSourceGroup: true,
      })
    })

    it('shows the group-closed notice when the source group was auto-closed', async () => {
      mockedTransfer.mockResolvedValueOnce(makeTransferResponse({ sourceGroupClosed: true }))
      const s = makeTransfer([1])
      await s.open(1, 'Source')
      s.state.toGroupId = 2

      await s.submit()

      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.INFO,
          message: t('groups.messages.groupClosed'),
        }),
      )
    })

    it('is a no-op when valid is false', async () => {
      const s = makeTransfer([1])
      await s.open(1, 'Source')
      // no toGroupId set -> invalid

      await s.submit()

      expect(mockedTransfer).not.toHaveBeenCalled()
    })

    it('a rejected transfer does not throw and clears the loading flag', async () => {
      mockedTransfer.mockRejectedValueOnce(new Error('boom'))
      const s = makeTransfer([1])
      await s.open(1, 'Source')
      s.state.toGroupId = 2

      await expect(s.submit()).resolves.toBeUndefined()

      expect(s.state.loading).toBe(false)
      expect(s.state.open).toBe(true)
    })
  })

  describe('open() with a rejected preview', () => {
    it('does not throw and clears the previewing flag', async () => {
      mockedPreview.mockRejectedValueOnce(new Error('boom'))
      const s = makeTransfer([1])

      await expect(s.open(1, 'Source')).resolves.toBeUndefined()

      expect(s.state.previewing).toBe(false)
      expect(s.rows.value).toEqual([])
    })
  })
})
