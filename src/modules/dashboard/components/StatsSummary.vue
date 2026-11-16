<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-card md:p-5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="min-w-0">
        <h2 class="text-base font-bold text-foreground">{{ t('statistics.summary.title') }}</h2>
        <p class="text-xs text-muted-foreground">{{ t('statistics.summary.subtitle', { period: label }) }}</p>
      </div>
      <UiSpinner v-if="loading" :size="18" class="text-muted-foreground" />
      <UiBadge v-else-if="lines.length" :variant="HEALTH_LEVEL_VARIANTS[level]">{{ t(HEALTH_LEVEL_LABEL_KEYS[level]) }}</UiBadge>
    </div>
    <ul v-if="lines.length" class="mt-3 space-y-2">
      <li v-for="line in lines" :key="line.key" class="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
        <span :class="cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', SUMMARY_TONE_CLASSES[line.tone])" />
        <span>{{ line.text }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiBadge, UiSpinner } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import {
  HealthLevel,
  HEALTH_LEVEL_LABEL_KEYS,
  HEALTH_LEVEL_VARIANTS,
  SUMMARY_TONE_CLASSES,
} from '../enums/health-level.enum'
import type { SummaryLine } from '../interfaces/summary-line.interface'

const { t } = useI18n()
defineProps<{ lines: SummaryLine[]; level: HealthLevel; label: string; loading?: boolean }>()
</script>
