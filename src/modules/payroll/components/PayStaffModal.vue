<template>
  <UiModal
    :model-value="modelValue"
    :title="t('payroll.modal.title')"
    :close-on-overlay="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="staff" class="space-y-4">
      <PayStaffSummary :staff="staff" />

      <UiInput
        :model-value="amount ?? ''"
        type="number"
        :label="t('payroll.modal.amountLabel')"
        :hint="`${t('payroll.table.remainingShort')}: ${formatSom(remaining)}`"
        :error="amountError || undefined"
        :disabled="loading"
        @update:model-value="amount = $event === '' ? null : Number($event)"
      />
      <UiTextarea v-model="comment" :label="t('payroll.modal.commentLabel')" :rows="2" :disabled="loading" />

      <PayStaffDeductionFields
        v-if="canDeduct"
        v-model:enabled="withDeduction"
        v-model:amount="deductionAmount"
        v-model:reason="deductionReason"
        v-model:type="deductionType"
        :disabled="loading"
      />

      <PayHistoryList v-if="staff.paymentHistory?.length" :items="staff.paymentHistory" />
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('update:modelValue', false)">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="loading" :disabled="!canConfirm" @click="emit('confirm')">
        {{ t('payroll.modal.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiTextarea, UiButton } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { getRemaining } from '../utils/payroll-salary'
import PayStaffSummary from './PayStaffSummary.vue'
import PayHistoryList from './PayHistoryList.vue'
import PayStaffDeductionFields from './PayStaffDeductionFields.vue'
import { StaffDeductionType } from '@/modules/staff/enums/staff-deduction-type.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  staff: StaffSalary | null
  canDeduct?: boolean
  /** True once a valid fine (amount + reason) has been entered. */
  deductionReady?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()

const amount = defineModel<number | null>('amount', { default: null })
const comment = defineModel<string>('comment', { default: '' })
const withDeduction = defineModel<boolean>('withDeduction', { default: false })
const deductionAmount = defineModel<number | null>('deductionAmount', { default: null })
const deductionReason = defineModel<string>('deductionReason', { default: '' })
const deductionType = defineModel<StaffDeductionType>('deductionType', {
  default: StaffDeductionType.OTHER,
})

const remaining = computed(() => (props.staff ? getRemaining(props.staff) : 0))

const amountError = computed(() => {
  const value = amount.value ?? 0
  if (value === 0) return '' // A fine alone is allowed — amount 0 is valid then.
  if (value < 0) return t('payroll.validation.greaterThanZero')
  if (value > remaining.value) {
    return t('payroll.validation.exceedsRemaining', { amount: formatSom(remaining.value) })
  }
  return ''
})

/** Either real money moves, or a valid fine is being written — not neither. */
const canConfirm = computed(() => {
  if (amountError.value) return false
  const paying = (amount.value ?? 0) > 0
  return withDeduction.value ? props.deductionReady === true : paying
})
</script>
