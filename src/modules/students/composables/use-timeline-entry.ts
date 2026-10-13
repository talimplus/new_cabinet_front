import {
  ArrowLeftRight, BadgeDollarSign, CalendarOff, Clock, Coins, DoorOpen, Link2Off, Pause,
  Pencil, PhoneCall, ReceiptText, Scissors, Send, UserCheck, UserPlus, Users, UserX,
  type FunctionalComponent,
} from '@/shared/icons'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { PAYMENT_METHOD_LABEL_KEYS, PaymentMethod } from '@/shared/enums/payment-method.enum'
import { RECEIPT_STATUS_LABEL_KEYS, ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { STUDENT_STATUS_LABEL_KEYS, StudentStatus } from '../enums/student-status.enum'
import { RETURN_LIKELIHOOD_LABEL_KEYS, ReturnLikelihood } from '../enums/return-likelihood.enum'
import { StudentTimelineType as T, TIMELINE_FIELD_LABEL_KEYS } from '../enums/student-timeline.enum'
import { TimelineTone as Tone } from '../enums/timeline-tone.enum'
import type { StudentTimelineDetails as D, StudentTimelineItem } from '../interfaces/student-timeline.interface'
import type { TimelineEntryView } from '../interfaces/student-timeline-entry.interface'

/** What a type contributes on top of the shared fields (time, actor, group). */
interface Shape {
  icon: FunctionalComponent
  tone: Tone
  title: string
  lines?: (string | false | null | undefined)[]
  note?: string | null
  amount?: TimelineEntryView['amount']
  badge?: TimelineEntryView['badge']
}

const k = (key: string, params?: Record<string, unknown>) => t(`students.timeline.${key}`, params ?? {})
const month = (ym?: string | null): string => {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return `${t(`common.months.${m}`)} ${y}`
}
const forMonth = (d: D) => d.forMonth && k('lines.forMonth', { month: month(d.forMonth) })
const money = (n: number | null | undefined, sign: '+' | '−', tone: Tone) =>
  ({ text: `${sign}${formatSom(n)}`, tone })
const label = <E extends string>(map: Record<E, string>, value?: string | null) =>
  value && value in map ? t(map[value as E]) : (value ?? '')
const discountValue = (d: D) =>
  d.amount ? formatSom(d.amount) : `${d.percent ?? 0}%`

function status(d: D): Shape {
  const to = d.toStatus as StudentStatus
  const from = d.fromStatus as StudentStatus | null | undefined
  const likelihood = d.returnLikelihood &&
    k('lines.likelihood', { value: label(RETURN_LIKELIHOOD_LABEL_KEYS, d.returnLikelihood as ReturnLikelihood) })
  if (to === StudentStatus.STOPPED) return { icon: Pause, tone: Tone.DANGER, title: k('title.stopped'), lines: [likelihood], note: d.comment }
  if (to === StudentStatus.ACTIVE) {
    const back = from === StudentStatus.STOPPED || from === StudentStatus.FINISHED
    return { icon: UserCheck, tone: Tone.SUCCESS, title: k(back ? 'title.returned' : 'title.activated'), note: d.comment }
  }
  const transition = from
    ? `${label(STUDENT_STATUS_LABEL_KEYS, from)} → ${label(STUDENT_STATUS_LABEL_KEYS, to)}`
    : label(STUDENT_STATUS_LABEL_KEYS, to)
  return { icon: UserCheck, tone: Tone.NEUTRAL, title: k('title.statusChanged'), lines: [transition, likelihood], note: d.comment }
}

function payment(d: D, actor: string | null): Shape {
  const s = d.status as ReceiptStatus
  const method = d.method && label(PAYMENT_METHOD_LABEL_KEYS, d.method as PaymentMethod)
  const confirmedBy = s === ReceiptStatus.CONFIRMED && d.confirmedByName && d.confirmedByName !== actor
  return {
    icon: ReceiptText,
    tone: s === ReceiptStatus.REJECTED ? Tone.DANGER : Tone.SUCCESS,
    title: k('title.paymentReceived'),
    lines: [
      [forMonth(d), method, d.checkNo && k('lines.check', { no: d.checkNo })].filter(Boolean).join(' · '),
      confirmedBy && k('lines.confirmedBy', { name: d.confirmedByName }),
    ],
    note: d.comment,
    amount: money(d.amount, '+', s === ReceiptStatus.REJECTED ? Tone.NEUTRAL : Tone.SUCCESS),
    badge: s === ReceiptStatus.CONFIRMED ? null : {
      text: label(RECEIPT_STATUS_LABEL_KEYS, s),
      variant: s === ReceiptStatus.REJECTED ? 'danger' : 'warning',
    },
  }
}

function attendance(d: D): Shape {
  if (d.status === AttendanceStatus.LATE) return { icon: Clock, tone: Tone.WARNING, title: k('title.late'), note: d.comment }
  if (d.status === AttendanceStatus.EXCUSED) return { icon: CalendarOff, tone: Tone.INFO, title: k('title.excused'), note: d.comment }
  return { icon: UserX, tone: Tone.DANGER, title: k('title.absent'), note: d.comment }
}

const SHAPES: Record<T, (d: D, item: StudentTimelineItem) => Shape> = {
  [T.LEAD_CREATED]: () => ({ icon: PhoneCall, tone: Tone.INFO, title: k('title.leadCreated') }),
  [T.CREATED]: (d) => ({ icon: UserPlus, tone: Tone.PRIMARY, title: k(d.fromLead ? 'title.createdFromLead' : 'title.created') }),
  [T.ACTIVATED]: () => ({ icon: UserCheck, tone: Tone.SUCCESS, title: k('title.activated') }),
  [T.STATUS_CHANGED]: status,
  [T.GROUP_JOINED]: (_d, i) => ({ icon: Users, tone: Tone.SUCCESS, title: k('title.groupJoined', { group: i.group?.name ?? '' }) }),
  [T.GROUP_LEFT]: (d, i) => ({ icon: DoorOpen, tone: Tone.WARNING, title: k('title.groupLeft', { group: i.group?.name ?? '' }), note: d.reason }),
  [T.TRANSFERRED]: (d) => ({
    icon: ArrowLeftRight, tone: Tone.INFO,
    title: k('title.transferred', { from: d.fromGroupName ?? '', to: d.toGroupName ?? '' }),
    lines: [
      d.transferDate && k('lines.transferDate', { date: formatDate(d.transferDate) }),
      !!d.carriedOverAmount && k('lines.carriedOver', { amount: formatSom(d.carriedOverAmount) }),
      !!d.refundedAmount && k('lines.refunded', { amount: formatSom(d.refundedAmount) }),
      !!d.remainingDebt && k('lines.remainingDebt', { amount: formatSom(d.remainingDebt) }),
      !!d.deletedAttendance && k('lines.deletedAttendance', { count: d.deletedAttendance }),
    ],
    note: d.reason,
  }),
  [T.PAYMENT_RECEIVED]: (d, i) => payment(d, i.actor?.name ?? null),
  [T.PAYMENT_REFUNDED]: (d) => ({ icon: Coins, tone: Tone.DANGER, title: k('title.refunded'), lines: [forMonth(d)], amount: money(d.amount, '−', Tone.DANGER) }),
  [T.PAYMENT_EXCLUDED]: (d) => ({
    icon: Scissors, tone: Tone.WARNING, title: k('title.excluded'),
    lines: [forMonth(d), d.newAmountDue != null && k('lines.newAmountDue', { amount: formatSom(d.newAmountDue) })],
    note: d.comment, amount: money(d.amount, '−', Tone.WARNING),
  }),
  [T.DISCOUNT_PERIOD]: (d) => ({
    icon: BadgeDollarSign, tone: Tone.INFO,
    title: k('title.discount', { value: discountValue(d) }),
    lines: [d.toMonth ? `${month(d.fromMonth)} — ${month(d.toMonth)}` : k('lines.fromMonth', { month: month(d.fromMonth) })],
    note: d.reason,
  }),
  [T.FEE_CHANGED]: (d) => ({
    icon: BadgeDollarSign, tone: Tone.INFO, title: k('title.feeChanged'),
    lines: [
      k('lines.fromMonth', { month: month(d.fromMonth) }),
      d.monthlyFee ? k('lines.personalFee', { amount: formatSom(d.monthlyFee) }) : k('lines.groupFee'),
      (d.percent || d.amount) ? k('lines.discountValue', { value: discountValue(d) }) : k('lines.noDiscount'),
    ],
    note: d.reason,
  }),
  [T.REFERRED]: (d) => ({ icon: Users, tone: Tone.PRIMARY, title: k('title.referred', { name: d.referrerName ?? '' }) }),
  [T.TELEGRAM_LINKED]: (d) => ({ icon: Send, tone: Tone.INFO, title: k('title.telegramLinked'), lines: [[d.parentName, d.username && `@${d.username}`].filter(Boolean).join(' · ')] }),
  [T.TELEGRAM_UNLINKED]: (d) => ({ icon: Link2Off, tone: Tone.NEUTRAL, title: k(d.blocked ? 'title.telegramBlocked' : 'title.telegramUnlinked'), lines: [d.parentName] }),
  [T.ATTENDANCE]: attendance,
  [T.PROFILE_UPDATED]: (d) => ({
    icon: Pencil, tone: Tone.NEUTRAL, title: k('title.profileUpdated'),
    lines: [d.fields?.length ? k('lines.fields', { fields: d.fields.map((f) => TIMELINE_FIELD_LABEL_KEYS[f] ? t(TIMELINE_FIELD_LABEL_KEYS[f]) : f).join(', ') }) : null],
  }),
}

const FALLBACK = (): Shape => ({ icon: Pencil, tone: Tone.NEUTRAL, title: k('title.unknown') })

/** `HH:mm` in the viewer's local time, or null for date-only events. */
function timeOf(item: StudentTimelineItem): string | null {
  if (item.dateOnly) return null
  const d = new Date(item.occurredAt)
  if (Number.isNaN(d.getTime())) return null
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Turns a raw backend event into translated, render-ready text. */
export function describeTimelineItem(item: StudentTimelineItem): TimelineEntryView {
  const shape = (SHAPES[item.type] ?? FALLBACK)(item.details ?? {}, item)
  const showGroup = item.type !== T.GROUP_JOINED && item.type !== T.GROUP_LEFT
  return {
    id: item.id,
    icon: shape.icon,
    tone: shape.tone,
    title: shape.title,
    lines: (shape.lines ?? []).filter((l): l is string => typeof l === 'string' && l.length > 0),
    note: shape.note?.trim() || null,
    amount: shape.amount ?? null,
    badge: shape.badge ?? null,
    time: timeOf(item),
    actor: item.actor?.name || null,
    group: showGroup ? (item.group?.name ?? null) : null,
  }
}
