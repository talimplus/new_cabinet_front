<template>
  <UiModal :model-value="modelValue" :title="t('pendingReceipts.confirmTitle')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="receipt" class="space-y-3 text-sm">
      <p>
        <strong>{{ receipt.payment.student.firstName }} {{ receipt.payment.student.lastName }}</strong>
        {{ t('pendingReceipts.confirmQuestion') }}
      </p>
      <div class="flex justify-between border-t border-border pt-2">
        <span class="text-muted-foreground">{{ t('pendingReceipts.amount') }}</span>
        <span class="font-mono font-semibold text-foreground">{{ formatSom(parseFloat(receipt.amount)) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">{{ t('pendingReceipts.columns.month') }}</span>
        <span class="font-mono">{{ formatMonth(receipt.payment.forMonth) }}</span>
      </div>
    </div>
    <template #footer>
      <UiButton variant="outline" :disabled="loading" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="emit('confirm')">{{ t('pendingReceipts.approve') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { UiModal, UiButton } from '@/shared/components'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import type { PendingReceipt } from '../interfaces/pending-receipt.interface'

const { t } = useI18n()

defineProps<{ modelValue: boolean; receipt: PendingReceipt | null; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()
</script>
