import { ref, computed } from 'vue'
import { fetchScheduleBoard } from '../api/schedule.api'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { t } from '@/locales'
import type { ScheduleBoard, ScheduleLesson } from '../interfaces/schedule-board.interface'

/** Vertical scale of the board — a 90-min lesson is ≈ 108px tall. */
export const PX_PER_MINUTE = 1.2
const FALLBACK_START = 8 * 60 // 08:00
const FALLBACK_END = 20 * 60 // 20:00

const DAY_ORDER: WeekDay[] = [
  WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY,
  WeekDay.FRIDAY, WeekDay.SATURDAY, WeekDay.SUNDAY,
]

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}
const toLabel = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** One lesson placed on the board (pixel position + overlap lane). */
export interface PositionedLesson {
  lesson: ScheduleLesson
  top: number
  height: number
  lane: number
  lanes: number
  overlap: boolean
}

export interface BoardColumn {
  key: string
  id: number | null
  name: string
  items: PositionedLesson[]
}

/** Splits a room's day into side-by-side lanes; >1 lane in a cluster = a conflict. */
function place(lessons: ScheduleLesson[], gridStart: number): PositionedLesson[] {
  const sorted = [...lessons].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime) || toMinutes(a.endTime) - toMinutes(b.endTime),
  )
  const out: PositionedLesson[] = []
  let cluster: PositionedLesson[] = []
  let clusterEnd = -1
  const flush = (): void => {
    // Re-pack into the fewest lanes: reuse a lane whose last lesson already ended.
    const laneEnds: number[] = []
    for (const p of cluster) {
      const start = toMinutes(p.lesson.startTime)
      let lane = laneEnds.findIndex((end) => end <= start)
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
      laneEnds[lane] = toMinutes(p.lesson.endTime)
      p.lane = lane
    }
    // The final lane count is known only once every lesson is placed — apply it to
    // the whole cluster so overlapping lessons split the column evenly (not just
    // the later ones). >1 lane means a real same-room time conflict.
    const lanes = laneEnds.length
    const overlap = lanes > 1
    for (const p of cluster) {
      p.lanes = lanes
      p.overlap = overlap
    }
    out.push(...cluster)
    cluster = []
    clusterEnd = -1
  }
  for (const lesson of sorted) {
    const start = toMinutes(lesson.startTime)
    const end = toMinutes(lesson.endTime)
    if (cluster.length && start >= clusterEnd) flush()
    cluster.push({
      lesson,
      top: (start - gridStart) * PX_PER_MINUTE,
      height: Math.max(end - start, 30) * PX_PER_MINUTE - 4,
      lane: 0,
      lanes: 1,
      overlap: false,
    })
    clusterEnd = Math.max(clusterEnd, end)
  }
  if (cluster.length) flush()
  return out
}

/** Board state: the selected day, the room columns, and the time grid geometry. */
export function useSchedule() {
  const board = ref<ScheduleBoard | null>(null)
  const loading = ref(false)
  const selectedDay = ref<WeekDay>(DAY_ORDER[(new Date().getDay() + 6) % 7]!)

  async function load(): Promise<void> {
    loading.value = true
    try {
      board.value = await fetchScheduleBoard()
    } finally {
      loading.value = false
    }
  }

  const dayLessons = computed(() =>
    (board.value?.lessons ?? []).filter((l) => l.day === selectedDay.value),
  )

  const gridStart = computed(() => {
    const starts = dayLessons.value.map((l) => toMinutes(l.startTime))
    return Math.floor(Math.min(FALLBACK_START, ...starts) / 60) * 60
  })
  const gridEnd = computed(() => {
    const ends = dayLessons.value.map((l) => toMinutes(l.endTime))
    return Math.ceil(Math.max(FALLBACK_END, ...ends) / 60) * 60
  })
  const gridHeight = computed(() => (gridEnd.value - gridStart.value) * PX_PER_MINUTE)
  const hourMarks = computed(() => {
    const marks: Array<{ label: string; top: number }> = []
    for (let m = gridStart.value; m <= gridEnd.value; m += 60) {
      marks.push({ label: toLabel(m), top: (m - gridStart.value) * PX_PER_MINUTE })
    }
    return marks
  })

  const columns = computed<BoardColumn[]>(() => {
    const rooms = board.value?.rooms ?? []
    const cols: BoardColumn[] = rooms.map((r) => ({
      key: `room-${r.id}`,
      id: r.id,
      name: r.name,
      items: place(dayLessons.value.filter((l) => l.roomId === r.id), gridStart.value),
    }))
    // Lessons without a room get an extra trailing column.
    const orphans = dayLessons.value.filter((l) => !l.roomId)
    if (orphans.length) {
      cols.push({
        key: 'no-room',
        id: null,
        name: t('schedule.noRoomColumn'),
        items: place(orphans, gridStart.value),
      })
    }
    return cols
  })

  const setDay = (day: string): void => {
    selectedDay.value = day as WeekDay
  }

  return {
    board, loading, load,
    selectedDay, setDay,
    dayLessons, columns,
    gridStart, gridHeight, hourMarks,
  }
}
