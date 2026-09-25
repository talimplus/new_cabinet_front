import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PaymentExclusionCard from '../PaymentExclusionCard.vue'
import { PaymentStatus } from '../../enums/payment-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import type { ExclusionPreviewResponse } from '../../interfaces/payment-exclusion.interface'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { previewExclusion } from '../../api/payments.api'

import type * as PaymentsApiModule from '../../api/payments.api'

vi.mock('../../api/payments.api', () => ({
  previewExclusion: vi.fn<(typeof PaymentsApiModule)['previewExclusion']>(),
}))

const mockedPreviewExclusion = vi.mocked(previewExclusion)

const lastEmitted = (events: unknown[][] | undefined) => (events ? events[events.length - 1] : undefined)

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 9,
    student: { firstName: 'Ali', lastName: 'Valiyev' },
    group: { name: 'A1' },
    amountDue: 600000,
    amountPaid: 0,
    remainingAmount: 600000,
    status: PaymentStatus.UNPAID,
    forMonth: '2026-09',
    dueDate: '2026-09-10',
    hardDueDate: '2026-09-20',
    isOverdue: false,
    lessonsPlanned: 12,
    lessonsBillable: 12,
    createdAt: '2026-09-01',
    ...overrides,
  }
}

function makePreview(overrides: Partial<ExclusionPreviewResponse> = {}): ExclusionPreviewResponse {
  return {
    paymentId: 9,
    forMonth: '2026-09',
    lessonsPlanned: 12,
    lessonsBillable: 10,
    perLessonAmount: 50000,
    baseAmountDue: 600000,
    currentAmountDue: 600000,
    amountPaid: 0,
    excludeLessons: 2,
    excludedAmount: 100000,
    newAmountDue: 500000,
    newRemaining: 500000,
    ...overrides,
  }
}

describe('PaymentExclusionCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedPreviewExclusion.mockReset()
    mockedPreviewExclusion.mockResolvedValue(makePreview())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders both mode buttons', () => {
    const wrapper = mount(PaymentExclusionCard, { props: { payment: makePayment() } })
    expect(wrapper.text()).toContain(t('payments.exclusion.byLessons'))
    expect(wrapper.text()).toContain(t('payments.exclusion.byAmount'))
  })

  it('reveals the lessons input when "by lessons" is picked, and hides it again on a second click', async () => {
    const wrapper = mount(PaymentExclusionCard, { props: { payment: makePayment() } })
    const buttons = wrapper.findAll('button').filter((b) => b.text() === t('payments.exclusion.byLessons'))
    const byLessons = buttons[0]!

    expect(wrapper.find('input[type="number"]').exists()).toBe(false)

    await byLessons.trigger('click')
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)

    await byLessons.trigger('click')
    expect(wrapper.find('input[type="number"]').exists()).toBe(false)
  })

  it('shows the reason textarea only once a positive value is entered, with the required error while blank', async () => {
    const wrapper = mount(PaymentExclusionCard, { props: { payment: makePayment() } })
    const byLessons = wrapper
      .findAll('button')
      .filter((b) => b.text() === t('payments.exclusion.byLessons'))[0]!
    await byLessons.trigger('click')

    // No amount entered yet — not "active", so no reason field.
    expect(wrapper.find('textarea').exists()).toBe(false)

    await wrapper.find('input[type="number"]').setValue(2)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.text()).toContain(t('payments.exclusion.commentRequired'))

    await wrapper.find('textarea').setValue('kasal')
    expect(wrapper.text()).not.toContain(t('payments.exclusion.commentRequired'))
  })

  it('renders the resolved preview once it comes back', async () => {
    mockedPreviewExclusion.mockResolvedValue(
      makePreview({ perLessonAmount: 50000, excludedAmount: 100000, newAmountDue: 500000, newRemaining: 500000 }),
    )
    const wrapper = mount(PaymentExclusionCard, { props: { payment: makePayment() } })
    const byLessons = wrapper
      .findAll('button')
      .filter((b) => b.text() === t('payments.exclusion.byLessons'))[0]!
    await byLessons.trigger('click')
    await wrapper.find('input[type="number"]').setValue(2)

    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()

    expect(wrapper.text()).toContain(formatSom(50000))
    expect(wrapper.text()).toContain(formatSom(100000))
    expect(wrapper.text()).toContain(formatSom(500000))
  })

  it('emits change with the form/preview/valid/previewing shape, form matching the entered lessons + reason', async () => {
    mockedPreviewExclusion.mockResolvedValue(makePreview())
    const wrapper = mount(PaymentExclusionCard, { props: { payment: makePayment() } })
    const byLessons = wrapper
      .findAll('button')
      .filter((b) => b.text() === t('payments.exclusion.byLessons'))[0]!
    await byLessons.trigger('click')
    await wrapper.find('input[type="number"]').setValue(2)
    await wrapper.find('textarea').setValue('kasal')

    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()

    const last = lastEmitted(wrapper.emitted('change'))?.[0] as {
      active: boolean
      form: { excludeLessons?: number; comment?: string } | null
      preview: unknown
      valid: boolean
      previewing: boolean
    }
    expect(last.active).toBe(true)
    expect(last.valid).toBe(true)
    expect(last.previewing).toBe(false)
    expect(last.form).toEqual({ excludeLessons: 2, comment: 'kasal' })
    expect(last.preview).not.toBeNull()
  })
})
