import { computed, ref, watch } from 'vue'
import { checkScheduleConflicts } from '@/modules/schedule/api/schedule.api'
import { SCHEDULE_CONFLICT_MESSAGE_KEYS } from '@/modules/schedule/enums/schedule-conflict-reason.enum'
import type { ScheduleConflict, ScheduleConflictDay } from '@/modules/schedule/interfaces/schedule-conflict.interface'
import { WEEK_DAY_LABEL_KEYS } from '../enums/week-day.enum'
import { debounce } from '@/shared/utils/debounce'
import { t } from '@/locales'

export const CONFLICT_CHECK_DELAY = 400

export interface ScheduleConflictSource {
  isOpen: () => boolean
  slots: () => ScheduleConflictDay[]
  roomId: () => number | null
  teacherId: () => number | null
  duration: () => number
  excludeGroupId: () => number | null
}

const hhmm = (time: string): string => time.slice(0, 5)

/**
 * Live room/teacher double-booking check for the group form (mirrors old
 * cabinet_front): any change to the slots, room, teacher or duration re-checks
 * after a short debounce. A failed check never blocks saving — the backend
 * re-validates on submit — and a late response for stale input is dropped.
 */
export function useScheduleConflicts(src: ScheduleConflictSource) {
  const conflicts = ref<ScheduleConflict[]>([])
  const checking = ref(false)
  const checked = ref(false)
  let seq = 0

  function clear(): void {
    seq++
    conflicts.value = []
    checked.value = false
    checking.value = false
  }

  async function run(): Promise<void> {
    const days = src.slots().filter((s) => s.day && s.startTime)
    const roomId = src.roomId()
    const teacherId = src.teacherId()
    if (!src.isOpen() || !days.length || (roomId == null && teacherId == null)) return clear()

    const mine = ++seq
    checking.value = true
    try {
      const result = await checkScheduleConflicts({
        days,
        roomId: roomId ?? undefined,
        teacherId: teacherId ?? undefined,
        lessonDurationMinutes: src.duration(),
        excludeGroupId: src.excludeGroupId() ?? undefined,
      })
      if (mine !== seq) return
      conflicts.value = result
      checked.value = true
    } catch {
      if (mine !== seq) return
      conflicts.value = []
      checked.value = false
    } finally {
      if (mine === seq) checking.value = false
    }
  }

  const schedule = debounce(() => void run(), CONFLICT_CHECK_DELAY)

  watch(
    () => [src.isOpen(), src.slots(), src.roomId(), src.teacherId(), src.duration()],
    () => {
      clear()
      if (src.isOpen()) schedule()
    },
    { deep: true },
  )

  const messages = computed(() =>
    conflicts.value.map((c) =>
      t(SCHEDULE_CONFLICT_MESSAGE_KEYS[c.reason], {
        day: t(WEEK_DAY_LABEL_KEYS[c.day]),
        time: `${hhmm(c.requestedStartTime)}–${hhmm(c.requestedEndTime)}`,
        room: c.roomName ?? '—',
        teacher: c.teacherName ?? '—',
        group: c.groupName,
        busy: `${hhmm(c.startTime)}–${hhmm(c.endTime)}`,
      }),
    ),
  )

  return { conflicts, checking, checked, messages }
}
