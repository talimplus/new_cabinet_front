import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePaymentExport } from '../use-payment-export'
import { exportPayments as exportPaymentsApi } from '../../api/payments.api'
import { downloadBlob as downloadBlobUtil } from '@/shared/utils/download-file'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { PaymentStatus } from '../../enums/payment-status.enum'
import type { PaymentsParams } from '../../interfaces/payment-params.interface'
import type { PaymentsExportFile } from '../../api/payments.api'

import type * as PaymentsApiModule from '../../api/payments.api'

type PaymentsApi = typeof PaymentsApiModule

vi.mock('../../api/payments.api', () => ({
  exportPayments: vi.fn<PaymentsApi['exportPayments']>(),
}))

vi.mock('@/shared/utils/download-file', () => ({
  downloadBlob: vi.fn<(blob: Blob, filename: string) => void>(),
}))

const mockedExportPayments = vi.mocked(exportPaymentsApi)
const mockedDownloadBlob = vi.mocked(downloadBlobUtil)

function makeFile(overrides: Partial<PaymentsExportFile> = {}): PaymentsExportFile {
  return { blob: new Blob(['x']), filename: 'tolovlar.xlsx', ...overrides }
}

function baseParams(): PaymentsParams {
  return { status: PaymentStatus.UNPAID, forMonth: '2026-09' }
}

describe('usePaymentExport', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('exportMonth calls exportPayments(filterParams(true)), downloads and notifies success', async () => {
    const filterParams = vi.fn<(withMonth: boolean) => PaymentsParams>(() => baseParams())
    mockedExportPayments.mockResolvedValueOnce(makeFile())

    const exp = usePaymentExport(filterParams)
    await exp.exportMonth()

    expect(filterParams).toHaveBeenCalledWith(true)
    expect(mockedExportPayments).toHaveBeenCalledWith(baseParams())
    expect(mockedDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'tolovlar.xlsx')

    const notify = useNotificationStore()
    expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
  })

  it('exportPeriod uses filterParams(false) plus formatted dateFrom/dateTo and closes the dialog', async () => {
    const filterParams = vi.fn<(withMonth: boolean) => PaymentsParams>(() => baseParams())
    mockedExportPayments.mockResolvedValueOnce(makeFile())

    const exp = usePaymentExport(filterParams)
    exp.openPeriod()
    exp.period.from = new Date(2026, 8, 1)
    exp.period.to = new Date(2026, 8, 24)

    await exp.exportPeriod()

    expect(filterParams).toHaveBeenCalledWith(false)
    expect(mockedExportPayments).toHaveBeenCalledWith({
      ...baseParams(),
      dateFrom: '2026-09-01',
      dateTo: '2026-09-24',
    })
    expect(exp.period.open).toBe(false)
  })

  it('exportPeriod with from > to notifies an error and does not call the api', async () => {
    const filterParams = vi.fn<(withMonth: boolean) => PaymentsParams>(() => baseParams())
    const exp = usePaymentExport(filterParams)
    exp.openPeriod()
    exp.period.from = new Date(2026, 8, 24)
    exp.period.to = new Date(2026, 8, 1)

    await exp.exportPeriod()

    expect(mockedExportPayments).not.toHaveBeenCalled()
    const notify = useNotificationStore()
    expect(notify.items.some((n) => n.type === NotificationType.ERROR)).toBe(true)
  })

  it('exportPeriod omits either bound left null', async () => {
    const filterParams = vi.fn<(withMonth: boolean) => PaymentsParams>(() => baseParams())
    mockedExportPayments.mockResolvedValueOnce(makeFile())

    const exp = usePaymentExport(filterParams)
    exp.openPeriod()
    exp.period.from = new Date(2026, 8, 1)
    exp.period.to = null

    await exp.exportPeriod()

    expect(mockedExportPayments).toHaveBeenCalledWith({
      ...baseParams(),
      dateFrom: '2026-09-01',
      dateTo: undefined,
    })
  })

  // These run straight off a click handler, so a rejection must be swallowed
  // (the interceptor already toasted) or it becomes an unhandled rejection.
  it('swallows an api failure, clears the flag and does not download', async () => {
    const filterParams = vi.fn<(withMonth: boolean) => PaymentsParams>(() => baseParams())
    mockedExportPayments.mockRejectedValueOnce(new Error('network'))

    const exp = usePaymentExport(filterParams)
    const run = exp.exportMonth()
    expect(exp.exportingMonth.value).toBe(true)

    await expect(run).resolves.toBeUndefined()
    expect(exp.exportingMonth.value).toBe(false)
    expect(mockedDownloadBlob).not.toHaveBeenCalled()
  })

  it('keeps the period dialog open when the export fails so it can be retried', async () => {
    const filterParams = vi.fn<(withMonth: boolean) => PaymentsParams>(() => baseParams())
    mockedExportPayments.mockRejectedValueOnce(new Error('network'))

    const exp = usePaymentExport(filterParams)
    exp.openPeriod()
    exp.period.from = new Date(2026, 8, 1)
    exp.period.to = new Date(2026, 8, 24)

    const run = exp.exportPeriod()
    expect(exp.exportingPeriod.value).toBe(true)

    await expect(run).resolves.toBeUndefined()
    expect(exp.exportingPeriod.value).toBe(false)
    expect(exp.period.open).toBe(true)
  })
})
