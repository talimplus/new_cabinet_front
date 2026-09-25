<template>
  <div class="space-y-3 rounded-md border border-border p-3">
    <UiCheckbox v-model="enabled" :label="t('payroll.modal.addDeduction')" :disabled="disabled" />

    <template v-if="enabled">
      <UiInput
        :model-value="amount ?? ''"
        type="number"
        :label="t('staff.deduction.amount')"
        :hint="t('staff.deduction.amountHint')"
        :disabled="disabled"
        @update:model-value="amount = $event === '' ? null : Number($event)"
      />
      <UiSelect
        v-model="type"
        :options="typeOptions"
        :label="t('staff.deduction.type')"
        :searchable="false"
        :clearable="false"
        :disabled="disabled"
      />
      <UiTextarea
        v-model="reason"
        :label="t('staff.deduction.reason')"
        :rows="2"
        :disabled="disabled"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCheckbox, UiInput, UiSelect, UiTextarea } from '@/shared/components'
import {
  StaffDeductionType,
  DEDUCTION_TYPE_LABEL_KEYS,
} from '@/modules/staff/enums/staff-deduction-type.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

defineProps<{ disabled?: boolean }>()

const enabled = defineModel<boolean>('enabled', { default: false })
const amount = defineModel<number | null>('amount', { default: null })
const reason = defineModel<string>('reason', { default: '' })
const type = defineModel<StaffDeductionType>('type', { default: StaffDeductionType.OTHER })

const typeOptions = computed<SelectOption[]>(() =>
  Object.values(StaffDeductionType).map((v) => ({
    label: t(DEDUCTION_TYPE_LABEL_KEYS[v]),
    value: v,
  })),
)
</script>
