<template>
  <div class="space-y-3 rounded-md border border-border bg-surface-muted p-3">
    <p class="text-sm font-medium text-foreground">{{ t('payments.exclusion.title') }}</p>

    <div class="flex gap-2">
      <UiButton
        v-for="option in MODES"
        :key="option"
        size="sm"
        :variant="mode === option ? 'primary' : 'outline'"
        :disabled="disabled"
        @click="setMode(mode === option ? null : option)"
      >
        {{ t(MODE_LABEL_KEYS[option]) }}
      </UiButton>
    </div>

    <UiInput
      v-if="mode === 'lessons'"
      :model-value="lessons ?? ''"
      type="number"
      :label="t('payments.exclusion.excludeLessons')"
      :disabled="disabled"
      @update:model-value="lessons = toNumberOrNull($event)"
    />
    <UiInput
      v-if="mode === 'amount'"
      :model-value="amount ?? ''"
      type="number"
      :label="t('payments.exclusion.excludeAmount')"
      :hint="t('payments.dialog.sumSuffix')"
      :disabled="disabled"
      @update:model-value="amount = toNumberOrNull($event)"
    />

    <!-- The reason is what an auditor reads later, so it is mandatory. -->
    <UiTextarea
      v-if="active"
      v-model="comment"
      :label="t('payments.exclusion.comment')"
      :rows="2"
      :disabled="disabled"
      :error="valid ? undefined : t('payments.exclusion.commentRequired')"
    />

    <p v-if="previewing" class="text-xs text-muted-foreground">
      {{ t('payments.exclusion.calculating') }}
    </p>
    <div v-else-if="active && preview" class="space-y-1 border-t border-border pt-2">
      <PaymentInfoRow
        :label="t('payments.exclusion.perLesson')"
        :value="formatSom(preview.perLessonAmount)"
      />
      <PaymentInfoRow :label="t('payments.exclusion.excludedAmount')">
        <span class="text-warning">− {{ formatSom(preview.excludedAmount) }}</span>
      </PaymentInfoRow>
      <PaymentInfoRow
        :label="t('payments.exclusion.newAmountDue')"
        :value="formatSom(preview.newAmountDue)"
      />
      <PaymentInfoRow :label="t('payments.exclusion.newRemaining')" strong>
        <span class="text-primary">{{ formatSom(preview.newRemaining) }}</span>
      </PaymentInfoRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiInput, UiTextarea } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import PaymentInfoRow from './PaymentInfoRow.vue'
import { usePaymentExclusion, type ExclusionMode } from '../composables/use-payment-exclusion'
import type { Payment } from '../interfaces/payment.interface'
import type { ExclusionState } from '../interfaces/payment-exclusion.interface'

const { t } = useI18n()

const props = defineProps<{ payment: Payment | null; disabled?: boolean }>()
const emit = defineEmits<{ change: [state: ExclusionState] }>()

const { mode, lessons, amount, comment, preview, previewing, active, valid, state, setMode } =
  usePaymentExclusion(() => props.payment)

// The dialog needs `form`/`valid`/`previewing` to gate its confirm button.
watch(state, (value) => emit('change', value), { immediate: true })

const MODES: ExclusionMode[] = ['lessons', 'amount']
const MODE_LABEL_KEYS: Record<ExclusionMode, string> = {
  lessons: 'payments.exclusion.byLessons',
  amount: 'payments.exclusion.byAmount',
}

const toNumberOrNull = (value: string | number): number | null =>
  value === '' ? null : Number(value)
</script>
