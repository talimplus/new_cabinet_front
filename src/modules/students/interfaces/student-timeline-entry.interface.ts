import type { FunctionalComponent } from '@/shared/icons'
import type { TimelineTone } from '../enums/timeline-tone.enum'

/** A timeline event, already translated and ready to render. */
export interface TimelineEntryView {
  id: string
  icon: FunctionalComponent
  tone: TimelineTone
  title: string
  /** Secondary facts, one per line (month, method, carried-over sum…). */
  lines: string[]
  /** Free text someone typed (reason, comment) — shown as a quote. */
  note: string | null
  /** Signed money figure on the right, e.g. `+290 000 so'm`. */
  amount: { text: string; tone: TimelineTone } | null
  /** Status pill (pending/rejected receipt). */
  badge: { text: string; variant: 'warning' | 'danger' } | null
  /** `HH:mm`, or null when only the date is known. */
  time: string | null
  actor: string | null
  group: string | null
}

/** One calendar day of entries. */
export interface TimelineDay {
  key: string
  label: string
  entries: TimelineEntryView[]
}
