<template>
  <div class="rounded-md border border-border bg-surface-muted p-3">
    <p class="text-sm font-medium text-foreground">{{ t('students.view.modal.previewTitle') }}</p>
    <p class="text-xs text-muted-foreground">{{ t('students.view.modal.previewHint') }}</p>

    <p v-if="!rows.length" class="mt-2 text-xs text-muted-foreground">
      {{ t('students.view.modal.previewEmpty') }}
    </p>
    <div
      v-for="row in rows"
      :key="`${row.forMonth}-${row.groupName}`"
      class="flex items-center justify-between gap-3 border-t border-border py-1.5 text-sm first-of-type:mt-2"
    >
      <span class="min-w-0 truncate">
        <span class="font-mono">{{ formatMonth(row.forMonth) }}</span>
        <span class="text-muted-foreground"> · {{ row.groupName }}</span>
      </span>
      <span class="font-mono font-medium text-foreground">{{ formatSom(row.allocated) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import type { DebtAllocation } from '../../interfaces/pay-debt.interface'

const { t } = useI18n()

defineProps<{ rows: DebtAllocation[] }>()
</script>
