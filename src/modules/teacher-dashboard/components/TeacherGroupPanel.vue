<template>
  <UiCollapse :open="open" @update:open="emit('update:open', $event)">
    <template #title>
      <span class="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <span class="truncate font-semibold">{{ g.name }}</span>
        <span class="text-xs font-normal text-muted-foreground">
          {{ t('teacherDashboard.group.studentsCount', { count: g.studentsCount }) }}
        </span>
      </span>
    </template>
    <template #meta>
      <!-- At a glance: how many paid / part paid / not paid, and the month's open money. -->
      <span class="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <UiBadge v-if="g.paidCount" variant="success" :title="t('teacherDashboard.state.paid')"><UiIcon :icon="Check" :size="12" />{{ g.paidCount }}</UiBadge>
        <UiBadge v-if="g.partialCount" variant="warning" :title="t('teacherDashboard.state.partial')"><UiIcon :icon="Minus" :size="12" />{{ g.partialCount }}</UiBadge>
        <UiBadge v-if="g.unpaidCount" variant="danger" :title="t('teacherDashboard.state.unpaid')"><UiIcon :icon="X" :size="12" />{{ g.unpaidCount }}</UiBadge>
        <span v-if="g.totalDebt > 0" class="hidden font-mono text-xs font-semibold text-danger sm:inline">
          {{ formatMoneyShort(g.totalDebt) }}
        </span>
      </span>
    </template>

    <div class="space-y-3">
      <TeacherGroupSummary :group="g" />
      <TeacherGroupStudents
        :rows="panel.rows"
        :can-open="canOpenStudent"
        @open="emit('open-student', $event)"
      />
      <div v-if="canOpenGroup" class="flex justify-end">
        <UiButton size="sm" variant="outline" @click="emit('open-group', g.id)">
          {{ t('teacherDashboard.group.openGroup') }}
        </UiButton>
      </div>
    </div>
  </UiCollapse>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiButton, UiCollapse, UiIcon } from '@/shared/components'
import { Check, Minus, X } from '@/shared/icons'
import { formatMoneyShort } from '@/shared/utils/format-money'
import TeacherGroupSummary from './TeacherGroupSummary.vue'
import TeacherGroupStudents from './TeacherGroupStudents.vue'
import type { GroupPanel } from '../interfaces/group-panel.interface'

const { t } = useI18n()
const props = defineProps<{ panel: GroupPanel; open: boolean; canOpenGroup?: boolean; canOpenStudent?: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'open-group': [id: number]
  'open-student': [id: number]
}>()
const g = computed(() => props.panel.group)
</script>
