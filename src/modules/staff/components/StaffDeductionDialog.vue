<template>
  <UiModal :model-value="open" :title="t('staff.deduction.title')" size="sm" @update:model-value="emit('close')">
    <div class="space-y-3">
      <UiInput
        :model-value="amount ?? ''"
        type="number"
        :label="t('staff.deduction.amount')"
        :hint="t('staff.deduction.amountHint')"
        :disabled="loading"
        @update:model-value="emit('update:amount', $event === '' ? null : Number($event))"
      />
      <UiSelect
        v-model="type"
        :options="typeOptions"
        :label="t('staff.deduction.type')"
        :searchable="false"
        :clearable="false"
        :disabled="loading"
      />
      <UiTextarea
        v-model="reason"
        :label="t('staff.deduction.reason')"
        :hint="t('staff.deduction.reasonHint')"
        :rows="2"
        :disabled="loading"
      />
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="loading" :disabled="!valid" @click="emit('confirm')">
        {{ t('common.save') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiInput, UiSelect, UiTextarea } from '@/shared/components'
import { StaffDeductionType, DEDUCTION_TYPE_LABEL_KEYS } from '../enums/staff-deduction-type.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

defineProps<{ open: boolean; amount: number | null; valid?: boolean; loading?: boolean }>()
const emit = defineEmits<{ close: []; confirm: []; 'update:amount': [value: number | null] }>()

const type = defineModel<StaffDeductionType>('type', { required: true })
const reason = defineModel<string>('reason', { required: true })

const typeOptions = computed<SelectOption[]>(() =>
  Object.values(StaffDeductionType).map((v) => ({ label: t(DEDUCTION_TYPE_LABEL_KEYS[v]), value: v })),
)
</script>
