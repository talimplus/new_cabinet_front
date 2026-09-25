<template>
  <div>
    <div class="flex flex-wrap items-center justify-end gap-1.5">
      <!-- Prorated: the full month struck through, the billed figure beside it. -->
      <span v-if="prorated" class="font-mono text-xs text-muted-foreground line-through">
        {{ formatSom(month.fullAmount) }}
      </span>
      <span class="font-mono font-medium text-foreground">{{ formatSom(month.amountDue) }}</span>
      <span v-if="prorated && month.lessonsPlanned != null" class="text-xs text-muted-foreground">
        ·
        {{ t('students.view.table.lessonsShort', {
          billable: month.lessonsBillable ?? 0,
          planned: month.lessonsPlanned,
        }) }}
      </span>
    </div>

    <p v-if="(month.lessonsExcused ?? 0) > 0" class="mt-0.5 border-s-2 border-info ps-2 text-xs text-info">
      {{ t('students.view.table.excused', { count: month.lessonsExcused }) }}
    </p>
    <p v-if="(month.manualExcludedAmount ?? 0) > 0" class="mt-0.5 text-xs text-warning">
      {{ t('students.view.table.excluded', { amount: formatSom(month.manualExcludedAmount) }) }}
      <span v-if="month.manualExcludedReason">({{ month.manualExcludedReason }})</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import type { StudentSummaryMonth } from '../../interfaces/student-summary.interface'

const { t } = useI18n()

const props = defineProps<{ month: StudentSummaryMonth }>()

const prorated = computed(() => props.month.isProrated === true && !!props.month.fullAmount)
</script>
