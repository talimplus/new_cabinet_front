import { describe, it, expect } from 'vitest'
import { describeTimelineItem } from '../use-timeline-entry'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { PAYMENT_METHOD_LABEL_KEYS, PaymentMethod } from '@/shared/enums/payment-method.enum'
import { RECEIPT_STATUS_LABEL_KEYS, ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { StudentStatus, STUDENT_STATUS_LABEL_KEYS } from '../../enums/student-status.enum'
import { ReturnLikelihood, RETURN_LIKELIHOOD_LABEL_KEYS } from '../../enums/return-likelihood.enum'
import {
  StudentTimelineCategory as Cat,
  StudentTimelineType as T,
  TIMELINE_FIELD_LABEL_KEYS,
} from '../../enums/student-timeline.enum'
import { TimelineTone } from '../../enums/timeline-tone.enum'
import type {
  StudentTimelineDetails,
  StudentTimelineItem,
} from '../../interfaces/student-timeline.interface'

const ACTOR = { id: 52, name: 'Lazizbek Isaqov' }
const GROUP = { id: 160, name: 'Feruza-2' }

function make(
  type: T,
  details: StudentTimelineDetails = {},
  over: Partial<StudentTimelineItem> = {},
): StudentTimelineItem {
  return {
    id: `event:${type}`,
    type,
    category: Cat.PAYMENTS,
    occurredAt: '2026-10-13T05:49:48.281Z',
    dateOnly: false,
    actor: ACTOR,
    group: GROUP,
    details,
    ...over,
  }
}

const month = (m: string, y: string) => `${t(`common.months.${m}`)} ${y}`

describe('describeTimelineItem — payment_received', () => {
  const base: StudentTimelineDetails = {
    amount: 350000,
    status: ReceiptStatus.CONFIRMED,
    method: PaymentMethod.CASH,
    checkNo: '364',
    forMonth: '2026-08',
  }

  it('confirmed: success tone, +amount, month/method/check line, no badge', () => {
    const v = describeTimelineItem(make(T.PAYMENT_RECEIVED, base))
    expect(v.title).toBe(t('students.timeline.title.paymentReceived'))
    expect(v.tone).toBe(TimelineTone.SUCCESS)
    expect(v.amount).toEqual({ text: `+${formatSom(350000)}`, tone: TimelineTone.SUCCESS })
    expect(v.badge).toBeNull()
    expect(v.lines).toEqual([
      [
        t('students.timeline.lines.forMonth', { month: month('08', '2026') }),
        t(PAYMENT_METHOD_LABEL_KEYS[PaymentMethod.CASH]),
        t('students.timeline.lines.check', { no: '364' }),
      ].join(' · '),
    ])
  })

  it('pending: warning badge with the status label', () => {
    const v = describeTimelineItem(make(T.PAYMENT_RECEIVED, { ...base, status: ReceiptStatus.PENDING }))
    expect(v.badge).toEqual({
      text: t(RECEIPT_STATUS_LABEL_KEYS[ReceiptStatus.PENDING]),
      variant: 'warning',
    })
    expect(v.amount?.tone).toBe(TimelineTone.SUCCESS)
  })

  it('rejected: danger badge, danger marker and neutral amount', () => {
    const v = describeTimelineItem(make(T.PAYMENT_RECEIVED, { ...base, status: ReceiptStatus.REJECTED }))
    expect(v.badge).toEqual({
      text: t(RECEIPT_STATUS_LABEL_KEYS[ReceiptStatus.REJECTED]),
      variant: 'danger',
    })
    expect(v.tone).toBe(TimelineTone.DANGER)
    expect(v.amount?.tone).toBe(TimelineTone.NEUTRAL)
  })

  it('adds a confirmedBy line only when the confirmer differs from the actor', () => {
    const same = describeTimelineItem(make(T.PAYMENT_RECEIVED, { ...base, confirmedByName: ACTOR.name }))
    expect(same.lines).toHaveLength(1)

    const other = describeTimelineItem(make(T.PAYMENT_RECEIVED, { ...base, confirmedByName: 'Admin Y' }))
    expect(other.lines).toHaveLength(2)
    expect(other.lines[1]).toBe(t('students.timeline.lines.confirmedBy', { name: 'Admin Y' }))
  })

  it('omits the confirmedBy line for non-confirmed receipts', () => {
    const v = describeTimelineItem(
      make(T.PAYMENT_RECEIVED, { ...base, status: ReceiptStatus.PENDING, confirmedByName: 'Admin Y' }),
    )
    expect(v.lines).toHaveLength(1)
  })

  it('has no details line when month/method/check are all missing', () => {
    const v = describeTimelineItem(
      make(T.PAYMENT_RECEIVED, { amount: 1000, status: ReceiptStatus.CONFIRMED }),
    )
    expect(v.lines).toEqual([])
  })
})

describe('describeTimelineItem — other payment events', () => {
  it('refunded shows a minus amount in danger tone', () => {
    const v = describeTimelineItem(make(T.PAYMENT_REFUNDED, { amount: 5000, forMonth: '2026-10' }))
    expect(v.title).toBe(t('students.timeline.title.refunded'))
    expect(v.amount).toEqual({ text: `−${formatSom(5000)}`, tone: TimelineTone.DANGER })
  })

  it('excluded (real backend sample) shows new amount, comment as note', () => {
    const v = describeTimelineItem(
      make(T.PAYMENT_EXCLUDED, {
        amount: 30000, comment: 'Kasal', lessons: null, forMonth: '2026-10', newAmountDue: 73846.15,
      }),
    )
    expect(v.title).toBe(t('students.timeline.title.excluded'))
    expect(v.note).toBe('Kasal')
    expect(v.amount?.text).toBe(`−${formatSom(30000)}`)
    expect(v.lines).toContain(t('students.timeline.lines.newAmountDue', { amount: formatSom(73846.15) }))
    expect(v.lines).toContain(t('students.timeline.lines.forMonth', { month: month('10', '2026') }))
  })
})

describe('describeTimelineItem — status_changed', () => {
  const status = (d: StudentTimelineDetails) => describeTimelineItem(make(T.STATUS_CHANGED, d, { category: Cat.STATUS }))

  it('stopped: title, likelihood line and comment as note', () => {
    const v = status({
      fromStatus: StudentStatus.ACTIVE,
      toStatus: StudentStatus.STOPPED,
      returnLikelihood: ReturnLikelihood.MAYBE,
      comment: 'Oilaviy sabab',
    })
    expect(v.title).toBe(t('students.timeline.title.stopped'))
    expect(v.tone).toBe(TimelineTone.DANGER)
    expect(v.lines).toEqual([
      t('students.timeline.lines.likelihood', { value: t(RETURN_LIKELIHOOD_LABEL_KEYS[ReturnLikelihood.MAYBE]) }),
    ])
    expect(v.note).toBe('Oilaviy sabab')
  })

  it('stopped without likelihood has no lines', () => {
    expect(status({ toStatus: StudentStatus.STOPPED }).lines).toEqual([])
  })

  it('ACTIVE from stopped is "returned"', () => {
    const v = status({ fromStatus: StudentStatus.STOPPED, toStatus: StudentStatus.ACTIVE })
    expect(v.title).toBe(t('students.timeline.title.returned'))
    expect(v.tone).toBe(TimelineTone.SUCCESS)
  })

  it('ACTIVE from new is "activated"', () => {
    const v = status({ fromStatus: StudentStatus.NEW, toStatus: StudentStatus.ACTIVE })
    expect(v.title).toBe(t('students.timeline.title.activated'))
  })

  it('other transitions show "from → to" with translated labels', () => {
    const v = status({ fromStatus: StudentStatus.NEW, toStatus: StudentStatus.IGNORED })
    expect(v.title).toBe(t('students.timeline.title.statusChanged'))
    expect(v.lines[0]).toContain('→')
    expect(v.lines[0]).toBe(
      `${t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.NEW])} → ${t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.IGNORED])}`,
    )
  })

  it('other transition without a previous status shows only the target', () => {
    const v = status({ toStatus: StudentStatus.IGNORED })
    expect(v.lines).toEqual([t(STUDENT_STATUS_LABEL_KEYS[StudentStatus.IGNORED])])
  })
})

describe('describeTimelineItem — groups', () => {
  const transferred: StudentTimelineDetails = {
    reason: 'Vaqti mos kelmadi',
    toGroupId: 163,
    fromGroupId: 160,
    toGroupName: 'Feruza-1',
    fromGroupName: 'Feruza-2',
    transferDate: '2026-10-13',
    remainingDebt: 373846.15,
    refundedAmount: 0,
    carriedOverAmount: 0,
  }

  it('transferred: title has both group names, zero amounts are hidden, reason is the note', () => {
    const v = describeTimelineItem(make(T.TRANSFERRED, transferred, { group: null, category: Cat.GROUPS }))
    expect(v.title).toBe(t('students.timeline.title.transferred', { from: 'Feruza-2', to: 'Feruza-1' }))
    expect(v.note).toBe('Vaqti mos kelmadi')
    expect(v.lines).toEqual([
      t('students.timeline.lines.transferDate', { date: formatDate('2026-10-13') }),
      t('students.timeline.lines.remainingDebt', { amount: formatSom(373846.15) }),
    ])
  })

  it('transferred shows how many old-group marks were deleted', () => {
    const v = describeTimelineItem(make(T.TRANSFERRED, { ...transferred, deletedAttendance: 4 }))
    expect(v.lines).toContain(t('students.timeline.lines.deletedAttendance', { count: 4 }))
  })

  it('transferred shows carriedOver and refunded lines when > 0', () => {
    const v = describeTimelineItem(
      make(T.TRANSFERRED, { ...transferred, carriedOverAmount: 1000, refundedAmount: 2000, remainingDebt: 0 }),
    )
    expect(v.lines).toContain(t('students.timeline.lines.carriedOver', { amount: formatSom(1000) }))
    expect(v.lines).toContain(t('students.timeline.lines.refunded', { amount: formatSom(2000) }))
    expect(v.lines.join('|')).not.toContain(t('students.timeline.lines.remainingDebt', { amount: formatSom(0) }))
    expect(v.lines).toHaveLength(3)
  })

  it('group_joined / group_left carry the name in the title and hide the group chip', () => {
    const joined = describeTimelineItem(make(T.GROUP_JOINED, {}, { category: Cat.GROUPS }))
    expect(joined.title).toBe(t('students.timeline.title.groupJoined', { group: GROUP.name }))
    expect(joined.group).toBeNull()

    const left = describeTimelineItem(
      make(T.GROUP_LEFT, { reason: 'Sheet' }, { category: Cat.GROUPS, dateOnly: true, occurredAt: '2026-08-29', actor: null }),
    )
    expect(left.title).toBe(t('students.timeline.title.groupLeft', { group: GROUP.name }))
    expect(left.group).toBeNull()
    expect(left.note).toBe('Sheet')
    expect(left.actor).toBeNull()
  })

  it('other types keep the group name', () => {
    const v = describeTimelineItem(make(T.PAYMENT_REFUNDED, { amount: 1 }))
    expect(v.group).toBe(GROUP.name)
    expect(v.actor).toBe(ACTOR.name)
  })
})

describe('describeTimelineItem — attendance', () => {
  const att = (status: AttendanceStatus) =>
    describeTimelineItem(make(T.ATTENDANCE, { status, comment: null }, { category: Cat.ATTENDANCE }))

  it('absent / late / excused have their own titles', () => {
    expect(att(AttendanceStatus.ABSENT).title).toBe(t('students.timeline.title.absent'))
    expect(att(AttendanceStatus.LATE).title).toBe(t('students.timeline.title.late'))
    expect(att(AttendanceStatus.EXCUSED).title).toBe(t('students.timeline.title.excused'))
  })
})

describe('describeTimelineItem — profile_updated', () => {
  it('maps known field keys to labels and passes unknown ones through raw', () => {
    const v = describeTimelineItem(
      make(T.PROFILE_UPDATED, { fields: ['firstName', 'password', 'weirdField'] }, { category: Cat.PROFILE }),
    )
    const fields = [
      t(TIMELINE_FIELD_LABEL_KEYS.firstName!),
      t(TIMELINE_FIELD_LABEL_KEYS.password!),
      'weirdField',
    ].join(', ')
    expect(v.lines).toEqual([t('students.timeline.lines.fields', { fields })])
  })

  it('has no line without fields', () => {
    expect(describeTimelineItem(make(T.PROFILE_UPDATED, {})).lines).toEqual([])
  })
})

describe('describeTimelineItem — fee_changed', () => {
  const fee = (d: StudentTimelineDetails) => describeTimelineItem(make(T.FEE_CHANGED, d)).lines

  it('personal fee + percent discount', () => {
    expect(fee({ fromMonth: '2026-10', monthlyFee: 400000, percent: 10 })).toEqual([
      t('students.timeline.lines.fromMonth', { month: month('10', '2026') }),
      t('students.timeline.lines.personalFee', { amount: formatSom(400000) }),
      t('students.timeline.lines.discountValue', { value: '10%' }),
    ])
  })

  it('group fee + fixed-amount discount', () => {
    const lines = fee({ fromMonth: '2026-10', monthlyFee: null, amount: 50000 })
    expect(lines[1]).toBe(t('students.timeline.lines.groupFee'))
    expect(lines[2]).toBe(t('students.timeline.lines.discountValue', { value: formatSom(50000) }))
  })

  it('no discount', () => {
    expect(fee({ fromMonth: '2026-10' })[2]).toBe(t('students.timeline.lines.noDiscount'))
  })
})

describe('describeTimelineItem — shared fields', () => {
  it('dateOnly events have no time', () => {
    const v = describeTimelineItem(make(T.ATTENDANCE, { status: AttendanceStatus.ABSENT }, { dateOnly: true, occurredAt: '2026-09-14' }))
    expect(v.time).toBeNull()
  })

  it('timestamps render HH:mm in local time', () => {
    const iso = '2026-08-10T07:00:00.000Z'
    const d = new Date(iso)
    const expected = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    expect(describeTimelineItem(make(T.PAYMENT_REFUNDED, { amount: 1 }, { occurredAt: iso })).time).toBe(expected)
  })

  it('unparseable timestamp yields no time', () => {
    expect(describeTimelineItem(make(T.PAYMENT_REFUNDED, {}, { occurredAt: 'garbage' })).time).toBeNull()
  })

  it('unknown type falls back to the generic title', () => {
    const v = describeTimelineItem(make('brand_new_event' as T))
    expect(v.title).toBe(t('students.timeline.title.unknown'))
    expect(v.tone).toBe(TimelineTone.NEUTRAL)
    expect(v.lines).toEqual([])
  })

  it('whitespace-only note becomes null and notes are trimmed', () => {
    expect(describeTimelineItem(make(T.GROUP_LEFT, { reason: '   ' })).note).toBeNull()
    expect(describeTimelineItem(make(T.GROUP_LEFT, { reason: '  hi ' })).note).toBe('hi')
  })

  it('missing actor becomes null; missing details do not throw', () => {
    const item = { ...make(T.CREATED), actor: null, details: undefined } as unknown as StudentTimelineItem
    const v = describeTimelineItem(item)
    expect(v.actor).toBeNull()
    expect(v.title).toBe(t('students.timeline.title.created'))
  })
})
