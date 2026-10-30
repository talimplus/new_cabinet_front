<template>
  <div class="space-y-3" data-test="backdate-impact">
    <UiSpinner v-if="loading" />
    <template v-else-if="preview">
      <p v-if="!preview.rows.length" class="rounded-md bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
        {{ t('common.backdate.noChanges') }}
      </p>
      <template v-else>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div v-for="item in totals" :key="item.key" :class="cn('rounded-md px-3 py-2', item.tone)">
            <div class="text-xs">{{ t(item.label) }}</div>
            <div class="font-mono text-sm font-semibold">{{ formatSom(item.value) }}</div>
          </div>
        </div>
        <BackdateImpactRows :rows="preview.rows" />
      </template>
      <div v-if="preview.paidSalaryMonths.length" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
        <strong>{{ t('common.backdate.paidSalaryTitle') }}</strong>
        <ul class="mt-1 list-disc pl-4">
          <li v-for="m in preview.paidSalaryMonths" :key="`${m.teacherId}-${m.forMonth}`">
            {{ m.teacherName }} — <span class="font-mono">{{ formatMonth(m.forMonth) }}</span>
          </li>
        </ul>
        <p class="mt-1">{{ t('common.backdate.paidSalaryText') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiSpinner from '../UiSpinner.vue'
import BackdateImpactRows from './BackdateImpactRows.vue'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'

const { t } = useI18n()

const props = defineProps<{ preview: BackdatePreview | null; loading?: boolean }>()

/** Only non-zero totals are shown; debt growth is the headline. */
const totals = computed(() => {
  const p = props.preview?.totals
  if (!p) return []
  return [
    { key: 'up', label: 'common.backdate.debtIncrease', value: p.debtIncrease, tone: 'bg-warning-soft text-warning' },
    { key: 'down', label: 'common.backdate.debtDecrease', value: p.debtDecrease, tone: 'bg-success-soft text-success' },
    { key: 'refund', label: 'common.backdate.refund', value: p.refund, tone: 'bg-danger-soft text-danger' },
  ].filter((x) => x.value > 0)
})
</script>
