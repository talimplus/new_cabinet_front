<template>
  <div class="space-y-1.5 rounded-md border border-border bg-surface-muted p-3 text-sm">
    <div class="flex justify-between">
      <span class="text-muted-foreground">{{ t('payments.dialog.lessonsPlanned') }}</span>
      <span class="font-mono">{{ calc.lessonsPlanned }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">{{ t('payments.dialog.lessonsBillable') }}</span>
      <span class="font-mono">{{ calc.lessonsBillable }}</span>
    </div>
    <div v-if="calc.lessonsExcused" class="flex justify-between">
      <span class="text-muted-foreground">{{ t('payments.dialog.lessonsExcused') }}</span>
      <span class="font-mono text-info">{{ calc.lessonsExcused }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">{{ t('payments.dialog.discount') }}</span>
      <span class="font-mono">{{ calc.discountPercent }}%</span>
    </div>
    <div class="my-2 border-t border-border"></div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">{{ t('payments.dialog.currentAmount') }}</span>
      <span class="font-mono">{{ formatSom(calc.currentAmountDue) }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-muted-foreground">{{ t('payments.dialog.calculatedAmount') }}</span>
      <span class="font-mono font-medium text-primary">{{ formatSom(calc.amountDue) }}</span>
    </div>
    <div class="flex justify-between font-semibold">
      <span>{{ calc.difference < 0 ? t('payments.dialog.refunded') : t('payments.dialog.additional') }}</span>
      <span class="font-mono" :class="calc.difference < 0 ? 'text-success' : 'text-danger'">
        {{ formatSom(Math.abs(calc.difference)) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSom } from '@/shared/utils/format-money'
import type { PaymentCalculationResponse } from '../interfaces/payment-calculation.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ calc: PaymentCalculationResponse }>()
</script>
