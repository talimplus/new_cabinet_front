import { computed, ref } from 'vue'
import { t } from '@/locales'
import { toDateString } from '@/shared/utils/format-date'
import { timelineDayLabel } from '@/shared/utils/timeline-day'
import { usePermissions } from '@/shared/composables/use-permissions'
import { fetchGroupTimeline } from '../api/group-timeline.api'
import {
  GROUP_TIMELINE_CATEGORY_OF as CATEGORY_OF,
  GroupTimelineCategory,
  GroupTimelineType as T,
} from '../enums/group-timeline.enum'
import { describeGroupEvent, type GroupTimelineLinkAccess } from './use-group-timeline-entry'
import type { GroupTimelineEvent } from '../interfaces/group-timeline.interface'
import type { TimelineDay, TimelineEntryView } from '@/shared/interfaces/timeline-entry.interface'

/** Entries rendered before "show more". */
export const GROUP_TIMELINE_PAGE_SIZE = 30
/** This many same-kind student events on one day fold into one expandable entry. */
export const STUDENT_FOLD_MIN = 3

const FOLD_TITLE_KEYS: Partial<Record<T, string>> = {
  [T.STUDENT_JOINED]: 'groups.timeline.title.studentsJoined',
  [T.STUDENT_LEFT]: 'groups.timeline.title.studentsLeft',
  [T.STUDENT_TRANSFERRED_IN]: 'groups.timeline.title.studentsTransferredIn',
  [T.STUDENT_TRANSFERRED_OUT]: 'groups.timeline.title.studentsTransferredOut',
}

interface DatedEntry {
  date: string
  entry: TimelineEntryView
}

/**
 * Describes one day's events, folding a burst of the same student move
 * ("12 students joined") into a single entry whose children list the names.
 */
function describeDay(events: { e: GroupTimelineEvent; i: number }[], access: GroupTimelineLinkAccess, today: string): TimelineEntryView[] {
  const perType = new Map<T, number>()
  for (const { e } of events) if (FOLD_TITLE_KEYS[e.type]) perType.set(e.type, (perType.get(e.type) ?? 0) + 1)

  const out: TimelineEntryView[] = []
  const folded = new Map<T, TimelineEntryView>()
  for (const { e, i } of events) {
    const entry = describeGroupEvent(e, `${e.type}:${e.date}:${i}`, access, today)
    const count = perType.get(e.type) ?? 0
    if (count < STUDENT_FOLD_MIN) {
      out.push(entry)
      continue
    }
    let parent = folded.get(e.type)
    if (!parent) {
      parent = {
        ...entry,
        id: `fold:${e.type}:${e.date}`,
        title: t(FOLD_TITLE_KEYS[e.type]!, { count }),
        subject: null, group: null, note: null, lines: [], actor: null,
        children: [],
      }
      folded.set(e.type, parent)
      out.push(parent)
    }
    parent.children!.push(entry)
  }
  return out
}

/**
 * The group page's history: loads `/groups/:id/timeline` once (newest first),
 * shows it oldest day first, then filters by category, folds student bursts,
 * pages and groups by day on the client.
 */
export function useGroupTimeline(groupId: () => number) {
  const perms = usePermissions()
  const items = ref<GroupTimelineEvent[]>([])
  const loading = ref(false)
  const failed = ref(false)
  /** `null` = every category. */
  const category = ref<GroupTimelineCategory | null>(null)
  const limit = ref(GROUP_TIMELINE_PAGE_SIZE)
  let seq = 0

  async function load(): Promise<void> {
    const mine = ++seq
    loading.value = true
    failed.value = false
    try {
      const fresh = await fetchGroupTimeline(groupId())
      if (mine === seq) items.value = fresh
    } catch {
      if (mine === seq) failed.value = true // toasted by the interceptor; the tab offers a retry
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  function setCategory(value: GroupTimelineCategory | null): void {
    category.value = value
    limit.value = GROUP_TIMELINE_PAGE_SIZE
  }

  const counts = computed(() => {
    const out = {} as Partial<Record<GroupTimelineCategory, number>>
    for (const e of items.value) {
      const c = CATEGORY_OF[e.type] ?? GroupTimelineCategory.GROUP
      out[c] = (out[c] ?? 0) + 1
    }
    return out
  })

  /**
   * Every visible entry, with student bursts folded. Backend sends newest →
   * oldest; the tab reads like a story instead — oldest day at the top, the
   * latest at the bottom (as on the student card). Inside a day the backend's
   * order stays: group events, then student moves.
   */
  const entries = computed<DatedEntry[]>(() => {
    const today = toDateString(new Date())
    const access = { students: perms.canViewStudents.value, groups: perms.canViewGroups.value }
    const byDay = new Map<string, { e: GroupTimelineEvent; i: number }[]>()
    items.value.forEach((e, i) => {
      if (category.value && (CATEGORY_OF[e.type] ?? GroupTimelineCategory.GROUP) !== category.value) return
      const day = byDay.get(e.date) ?? []
      day.push({ e, i })
      byDay.set(e.date, day)
    })
    const out: DatedEntry[] = []
    for (const [date, events] of [...byDay].reverse())
      for (const entry of describeDay(events, access, today)) out.push({ date, entry })
    return out
  })

  const remaining = computed(() => Math.max(entries.value.length - limit.value, 0))

  const days = computed<TimelineDay[]>(() => {
    const now = new Date()
    const out: TimelineDay[] = []
    for (const { date, entry } of entries.value.slice(0, limit.value)) {
      let day = out[out.length - 1]
      if (!day || day.key !== date) {
        day = { key: date, label: timelineDayLabel(date, now), entries: [] }
        out.push(day)
      }
      day.entries.push(entry)
    }
    return out
  })

  function showMore(): void {
    limit.value += GROUP_TIMELINE_PAGE_SIZE
  }

  return { items, loading, failed, category, counts, days, remaining, load, setCategory, showMore }
}
