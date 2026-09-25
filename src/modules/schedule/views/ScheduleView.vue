<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTabs, UiIconButton, UiSpinner } from '@/shared/components'
import { RefreshCw } from '@/shared/icons'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import ScheduleBoard from '../components/ScheduleBoard.vue'
import ScheduleDayList from '../components/ScheduleDayList.vue'
import { useSchedule } from '../composables/use-schedule'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const { t } = useI18n()
const { board, loading, load, selectedDay, setDay, dayLessons, columns, gridHeight, hourMarks } =
  useSchedule()
onMounted(load)

const ORDER = [
  WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, WeekDay.THURSDAY,
  WeekDay.FRIDAY, WeekDay.SATURDAY, WeekDay.SUNDAY,
]
const dayTabs = computed<TabItem[]>(() =>
  ORDER.map((day) => ({ key: day, labelKey: `schedule.daysShort.${day}` })),
)
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-lg font-bold text-foreground">{{ t('schedule.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ t('schedule.subtitle') }}</p>
    </div>

    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1 overflow-x-auto">
        <UiTabs :tabs="dayTabs" :model-value="selectedDay" @update:model-value="setDay" />
      </div>
      <UiIconButton :icon="RefreshCw" :label="t('common.refresh')" @click="load" />
    </div>

    <div v-if="loading && !board" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <p v-else-if="board && !columns.length" class="rounded-md bg-info-soft px-3 py-2 text-sm text-info">
      {{ t('schedule.noRooms') }}
    </p>
    <template v-else-if="board">
      <p v-if="!dayLessons.length" class="rounded-md bg-info-soft px-3 py-2 text-sm text-info">
        {{ t('schedule.noLessonsThisDay') }}
      </p>
      <template v-else>
        <ScheduleBoard class="hidden md:block" :columns="columns" :grid-height="gridHeight" :hour-marks="hourMarks" />
        <div class="md:hidden"><ScheduleDayList :columns="columns" /></div>
      </template>
    </template>
  </div>
</template>
