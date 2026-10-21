import type { RouteLocationRaw } from 'vue-router'
import type { FunctionalComponent } from '@/shared/icons'
import type { TimelineTone } from '@/shared/enums/timeline-tone.enum'

/** A name on an entry — a link when the viewer can open its page. */
export interface TimelineLink {
  text: string
  to: RouteLocationRaw | null
}

/**
 * A timeline event, already translated and ready to render. Shared by the
 * student card and the group page — each module adapts its own backend shape.
 */
export interface TimelineEntryView {
  id: string
  icon: FunctionalComponent
  tone: TimelineTone
  title: string
  /** Who the event is about, rendered right before the title (e.g. a student). */
  subject?: TimelineLink | null
  /** Secondary facts, one per line (month, method, carried-over sum…). */
  lines: string[]
  /** Free text someone typed (reason, comment) — shown as a quote. */
  note: string | null
  /** Signed money figure on the right, e.g. `+290 000 so'm`. */
  amount: { text: string; tone: TimelineTone } | null
  /** Status pill (pending/rejected receipt, planned event). */
  badge: { text: string; variant: 'warning' | 'danger' | 'neutral' } | null
  /** `HH:mm`, or null when only the date is known. */
  time: string | null
  actor: string | null
  group: TimelineLink | null
  /** Not happened yet (a planned end date) — drawn faded. */
  planned?: boolean
  /** Same-day events folded into this one; listed when the entry is expanded. */
  children?: TimelineEntryView[]
}

/** One calendar day of entries. */
export interface TimelineDay {
  key: string
  label: string
  entries: TimelineEntryView[]
}

/** One filter chip above a timeline; `value: null` = everything. */
export interface TimelineFilterOption {
  key: string
  value: string | null
  label: string
  count: number
}
