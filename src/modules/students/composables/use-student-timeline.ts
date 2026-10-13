import { computed, ref } from 'vue'
import { t } from '@/locales'
import { formatDate, toDateString } from '@/shared/utils/format-date'
import { fetchStudentTimeline } from '../api/student-timeline.api'
import { StudentTimelineCategory } from '../enums/student-timeline.enum'
import { describeTimelineItem } from './use-timeline-entry'
import type { StudentTimelineItem } from '../interfaces/student-timeline.interface'
import type { TimelineDay } from '../interfaces/student-timeline-entry.interface'

/** Entries rendered before "show more" — a year of history can be hundreds. */
export const TIMELINE_PAGE_SIZE = 30

/** `YYYY-MM-DD` of an event in the viewer's local calendar. */
function dayKeyOf(item: StudentTimelineItem): string {
  if (item.dateOnly) return item.occurredAt.slice(0, 10)
  return toDateString(new Date(item.occurredAt)) || item.occurredAt.slice(0, 10)
}

function dayLabel(key: string, now: Date): string {
  if (key === toDateString(now)) return t('students.timeline.today')
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (key === toDateString(yesterday)) return t('students.timeline.yesterday')
  return formatDate(key)
}

/**
 * The student card's history: loads `/students/:id/timeline` once, then filters
 * by category, pages and groups by day on the client (the list is one student's
 * life — small enough to hold whole).
 */
export function useStudentTimeline(studentId: () => number | null) {
  const items = ref<StudentTimelineItem[]>([])
  const loading = ref(false)
  const failed = ref(false)
  /** `null` = every category. */
  const category = ref<StudentTimelineCategory | null>(null)
  const limit = ref(TIMELINE_PAGE_SIZE)

  /** Bumped per load — a response overtaken by a newer load is dropped. */
  let seq = 0
  let loadedFor: number | null = null

  async function load(): Promise<void> {
    const id = studentId()
    if (!id) return
    // Another student: never show the previous one's history meanwhile.
    if (id !== loadedFor) {
      items.value = []
      category.value = null
      limit.value = TIMELINE_PAGE_SIZE
      loadedFor = id
    }
    const mine = ++seq
    loading.value = true
    failed.value = false
    try {
      const { items: fresh } = await fetchStudentTimeline(id)
      if (mine === seq) items.value = fresh
    } catch {
      if (mine === seq) failed.value = true // toasted by the interceptor; the section offers a retry
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  function setCategory(value: StudentTimelineCategory | null): void {
    category.value = value
    limit.value = TIMELINE_PAGE_SIZE
  }

  const filtered = computed(() =>
    category.value ? items.value.filter((i) => i.category === category.value) : items.value,
  )

  /** Events per category — only the buckets that have any become filter chips. */
  const counts = computed(() => {
    const out = {} as Partial<Record<StudentTimelineCategory, number>>
    for (const i of items.value) out[i.category] = (out[i.category] ?? 0) + 1
    return out
  })

  const remaining = computed(() => Math.max(filtered.value.length - limit.value, 0))

  const days = computed<TimelineDay[]>(() => {
    const now = new Date()
    const out: TimelineDay[] = []
    for (const item of filtered.value.slice(0, limit.value)) {
      const key = dayKeyOf(item)
      let day = out[out.length - 1]
      if (!day || day.key !== key) {
        day = { key, label: dayLabel(key, now), entries: [] }
        out.push(day)
      }
      day.entries.push(describeTimelineItem(item))
    }
    return out
  })

  function showMore(): void {
    limit.value += TIMELINE_PAGE_SIZE
  }

  return { items, loading, failed, category, counts, days, remaining, load, setCategory, showMore }
}
