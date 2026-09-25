<template>
  <div class="rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="flex items-start gap-3">
      <span :class="cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', tone.bg)">
        <UiIcon :icon="checkedIn ? CheckCircle2 : MapPin" :size="20" :class="tone.fg" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-foreground">
          {{ checkedIn ? t('staffAttendance.card.checkedIn') : t('staffAttendance.card.notCheckedIn') }}
        </p>
        <p v-if="checkedIn" class="text-sm text-muted-foreground">
          {{ t('staffAttendance.card.arrivedAt', { time: arrivedAt }) }}
          <span v-if="lateMinutes > 0" class="text-warning">
            · {{ t('staffAttendance.card.lateBy', { minutes: lateMinutes }) }}
          </span>
        </p>
        <p v-else class="text-sm text-muted-foreground">
          {{ firstLessonAt
            ? t('staffAttendance.card.firstLesson', { time: firstLessonAt })
            : t('staffAttendance.card.noLessonToday') }}
        </p>
      </div>
    </div>

    <div v-if="!checkedIn" class="mt-4 space-y-3">
      <p class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('staffAttendance.card.geoNotice') }}</p>
      <UiButton block :loading="c.submitting.value" @click="c.submit">
        <UiIcon :icon="MapPin" :size="16" />{{ t('staffAttendance.card.checkInButton') }}
      </UiButton>
    </div>
    <p v-else-if="warningFlags.length" class="mt-3 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
      {{ warningFlags.map((f) => t(flagKeys[f])).join(' · ') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import { UiIcon, UiButton } from '@/shared/components'
import { MapPin, CheckCircle2 } from '@/shared/icons'
import { useCheckIn } from '@/shared/composables/use-check-in'
import { AttendanceFlag, ATTENDANCE_FLAG_LABEL_KEYS } from '@/shared/enums/attendance-flag.enum'

const { t } = useI18n()
const c = useCheckIn()
onMounted(c.load)

const flagKeys = ATTENDANCE_FLAG_LABEL_KEYS
const checkedIn = computed(() => !!c.today.value?.checkedIn)
const attendance = computed(() => c.today.value?.attendance ?? null)
const lateMinutes = computed(() => attendance.value?.lateMinutes ?? 0)
const arrivedAt = computed(() =>
  attendance.value
    ? new Date(attendance.value.checkInAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : '',
)
const firstLessonAt = computed(() => c.today.value?.firstLessonAt?.slice(0, 5) ?? '')
// The "no lesson" / "center not configured" flags aren't the teacher's fault → hidden.
const HIDDEN = [AttendanceFlag.NO_LESSON_TODAY, AttendanceFlag.CENTER_NOT_CONFIGURED]
const warningFlags = computed(() => (attendance.value?.flags ?? []).filter((f) => !HIDDEN.includes(f)))

const tone = computed(() =>
  checkedIn.value
    ? lateMinutes.value > 0
      ? { bg: 'bg-warning-soft', fg: 'text-warning' }
      : { bg: 'bg-success-soft', fg: 'text-success' }
    : { bg: 'bg-primary-soft', fg: 'text-primary' },
)
</script>
