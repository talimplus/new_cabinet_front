import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PayStaffModal from '../PayStaffModal.vue'
import { PayrollStatus } from '../../enums/payroll-status.enum'
import { StaffDeductionType } from '@/modules/staff/enums/staff-deduction-type.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StaffSalary } from '../../interfaces/staff-salary.interface'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

function setNumberInput(input: HTMLInputElement, value: number) {
  input.value = String(value)
  input.dispatchEvent(new Event('input'))
}

function makeStaff(overrides: Partial<StaffSalary> = {}): StaffSalary {
  return {
    id: 1,
    userId: 10,
    forMonth: '2026-09',
    baseSalary: 2_000_000,
    paidAmount: 500_000,
    remaining: 1_500_000,
    status: PayrollStatus.PARTIAL,
    paidAt: null,
    comment: null,
    createdAt: '2026-01-01',
    user: {
      id: 10, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998',
      role: 'manager', salary: 2_000_000, commissionPercentage: null, createdAt: '2026-01-01',
    },
    ...overrides,
  }
}

function mountModal(props: Record<string, unknown> = {}) {
  return mount(PayStaffModal, {
    attachTo: document.body,
    props: {
      modelValue: true,
      staff: makeStaff(),
      canDeduct: false,
      deductionReady: false,
      loading: false,
      amount: null,
      comment: '',
      withDeduction: false,
      deductionAmount: null,
      deductionReason: '',
      deductionType: StaffDeductionType.OTHER,
      ...props,
    },
  })
}

describe('PayStaffModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows worker / total / paid / remaining, all formatted with formatSom', () => {
    mountModal({ staff: makeStaff({ paidAmount: 500_000, remaining: 1_500_000, baseSalary: 2_000_000 }) })
    const text = document.body.textContent ?? ''
    expect(text).toContain('Ali Valiyev')
    expect(text).toContain(formatSom(2_000_000))
    expect(text).toContain(formatSom(500_000))
    expect(text).toContain(formatSom(1_500_000))
  })

  it('errors when the amount is negative', async () => {
    const wrapper = mountModal({ staff: makeStaff({ remaining: 1_000_000 }) })
    const input = document.body.querySelector('input[type="number"]') as HTMLInputElement
    setNumberInput(input, -100)
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain(t('payroll.validation.greaterThanZero'))
  })

  it('errors when the amount exceeds remaining', async () => {
    const wrapper = mountModal({ staff: makeStaff({ remaining: 1_000_000 }) })
    const input = document.body.querySelector('input[type="number"]') as HTMLInputElement
    setNumberInput(input, 1_500_000)
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain(
      t('payroll.validation.exceedsRemaining', { amount: formatSom(1_000_000) }),
    )
  })

  it('does not error at exactly 0 — a fine alone is legal', async () => {
    const wrapper = mountModal({ staff: makeStaff({ remaining: 1_000_000 }) })
    const input = document.body.querySelector('input[type="number"]') as HTMLInputElement
    setNumberInput(input, 0)
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).not.toContain(t('payroll.validation.greaterThanZero'))
    expect(document.body.textContent).not.toContain(
      t('payroll.validation.exceedsRemaining', { amount: formatSom(1_000_000) }),
    )
  })

  it('enables confirm with amount > 0 and no fine', () => {
    mountModal({ amount: 100_000, staff: makeStaff({ remaining: 1_000_000 }) })
    expect(findButton(t('payroll.modal.confirm')).disabled).toBe(false)
  })

  it('disables confirm at amount = 0 with no fine', () => {
    mountModal({ amount: 0, staff: makeStaff({ remaining: 1_000_000 }) })
    expect(findButton(t('payroll.modal.confirm')).disabled).toBe(true)
  })

  it('keeps confirm disabled at amount = 0 with withDeduction true but deductionReady false', () => {
    mountModal({
      amount: 0,
      canDeduct: true,
      withDeduction: true,
      deductionReady: false,
      staff: makeStaff({ remaining: 1_000_000 }),
    })
    expect(findButton(t('payroll.modal.confirm')).disabled).toBe(true)
  })

  it('enables confirm at amount = 0 once deductionReady becomes true (the core gating)', () => {
    mountModal({
      amount: 0,
      canDeduct: true,
      withDeduction: true,
      deductionReady: true,
      staff: makeStaff({ remaining: 1_000_000 }),
    })
    expect(findButton(t('payroll.modal.confirm')).disabled).toBe(false)
  })

  it('hides the deduction block without canDeduct', () => {
    mountModal({ canDeduct: false })
    expect(document.body.textContent).not.toContain(t('payroll.modal.addDeduction'))
  })

  it('shows the deduction block with canDeduct', () => {
    mountModal({ canDeduct: true })
    expect(document.body.textContent).toContain(t('payroll.modal.addDeduction'))
  })

  it('hides the deduction fields until the checkbox is ticked', () => {
    mountModal({ canDeduct: true, withDeduction: false })
    expect(document.body.textContent).not.toContain(t('staff.deduction.amount'))
  })

  it('ticking the checkbox reveals the deduction fields', async () => {
    const wrapper = mountModal({ canDeduct: true, withDeduction: false })
    expect(document.body.textContent).not.toContain(t('staff.deduction.amount'))

    const checkbox = document.body.querySelector('input[type="checkbox"]') as HTMLInputElement
    checkbox.click()
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain(t('staff.deduction.amount'))
  })

  it('renders payment history only when the staff has some', () => {
    mountModal({
      staff: makeStaff({
        paymentHistory: [
          { id: 1, amount: 200_000, comment: null, paidAt: '2026-01-01', paidBy: { id: 2, firstName: 'B', lastName: 'C' } },
        ],
      }),
    })
    expect(document.body.textContent).toContain(t('payroll.modal.previousPayments'))
  })

  it('hides payment history when there is none', () => {
    mountModal({ staff: makeStaff({ paymentHistory: [] }) })
    expect(document.body.textContent).not.toContain(t('payroll.modal.previousPayments'))
  })

  it('emits confirm from the confirm button', async () => {
    const wrapper = mountModal({ amount: 100_000, staff: makeStaff({ remaining: 1_000_000 }) })
    findButton(t('payroll.modal.confirm')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits update:modelValue(false) from the cancel button', async () => {
    const wrapper = mountModal()
    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:modelValue') ?? [])).toEqual([false])
  })
})
