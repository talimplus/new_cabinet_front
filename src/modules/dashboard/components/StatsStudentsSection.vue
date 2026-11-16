<template>
  <section class="space-y-3">
    <div>
      <h2 class="text-base font-bold text-foreground">{{ t('statistics.students.title') }}</h2>
      <p class="text-xs text-muted-foreground">{{ t('statistics.students.subtitle') }}</p>
    </div>
    <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <UiStatTile
        v-for="tile in tiles"
        :key="tile.kind"
        :label="t(STATS_STUDENTS_KIND_LABEL_KEYS[tile.kind])"
        :value="String(tile.value)"
        :hint="t(tile.hint)"
        :icon="tile.icon"
        :tone="tile.tone"
        :to="detailLink(StatsDetailKind.STUDENTS, query, { kind: tile.kind })"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiStatTile } from '@/shared/components'
import { GraduationCap, UserCheck, UserPlus, UserX } from '@/shared/icons'
import { StatsDetailKind } from '../enums/stats-detail-kind.enum'
import { StatsStudentsKind, STATS_STUDENTS_KIND_LABEL_KEYS } from '../enums/stats-students-kind.enum'
import { detailLink } from '../composables/use-detail-link'
import type { StatsOverviewResponse } from '../interfaces/stats-overview.interface'

const { t } = useI18n()
const props = defineProps<{ data: StatsOverviewResponse | null; query: Record<string, string> }>()

const tiles = computed(() => {
  const s = props.data?.students
  return [
    { kind: StatsStudentsKind.ACTIVE, value: s?.active ?? 0, hint: 'statistics.students.activeHint', icon: GraduationCap, tone: 'primary' as const },
    { kind: StatsStudentsKind.STARTED, value: s?.started ?? 0, hint: 'statistics.students.startedHint', icon: UserCheck, tone: 'success' as const },
    { kind: StatsStudentsKind.REGISTERED, value: s?.registered ?? 0, hint: 'statistics.students.registeredHint', icon: UserPlus, tone: 'info' as const },
    { kind: StatsStudentsKind.STOPPED, value: s?.stopped ?? 0, hint: 'statistics.students.stoppedHint', icon: UserX, tone: 'danger' as const },
  ]
})
</script>
