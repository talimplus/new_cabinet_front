<template>
  <ul class="divide-y divide-border rounded-md border border-border text-sm">
    <li
      v-for="row in rows"
      :key="`${row.studentId}-${row.groupId}-${row.forMonth}`"
      class="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0">
        <div class="truncate font-medium text-foreground">{{ row.studentName }}</div>
        <div class="truncate text-xs text-muted-foreground">
          {{ row.groupName }} · <span class="font-mono">{{ formatMonth(row.forMonth) }}</span>
          <span v-if="row.isNew"> · {{ t('common.backdate.newRow') }}</span>
        </div>
      </div>
      <div class="shrink-0 text-right font-mono text-xs sm:text-sm">
        <span class="text-muted-foreground">{{ formatMoney(row.currentDue) }}</span>
        → <strong class="text-foreground">{{ formatMoney(row.newDue) }}</strong>
        <div v-if="row.refund > 0" class="text-danger">
          {{ t('common.backdate.rowRefund', { amount: formatMoney(row.refund) }) }}
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMoney } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import type { BackdatePreviewRow } from '@/shared/interfaces/backdate-preview.interface'

const { t } = useI18n()

defineProps<{ rows: BackdatePreviewRow[] }>()
</script>
