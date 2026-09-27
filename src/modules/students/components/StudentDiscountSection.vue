<template>
  <div class="space-y-3 border-t border-border pt-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-foreground">{{ t('students.form.discountTitle') }}</h3>
      <UiCheckbox v-model="usePeriods" :label="t('students.form.byPeriods')" />
    </div>

    <div v-if="!usePeriods" class="grid gap-3 sm:grid-cols-3">
      <UiSelect v-model="type" :options="typeOptions" :label="t('students.form.discountType')" :searchable="false" :clearable="false" />
      <UiInput v-model="value" type="number" :label="t(DISCOUNT_TYPE_LABEL_KEYS[type])" />
      <UiInput v-model="reason" :label="t('students.form.reason')" />
    </div>

    <div v-else class="space-y-2">
      <StudentDiscountPeriodRow
        v-for="(row, i) in periods"
        :key="i"
        v-model:type="row.type"
        v-model:value="row.value"
        v-model:group-id="row.groupId"
        v-model:from-month="row.fromMonth"
        v-model:to-month="row.toMonth"
        v-model:reason="row.reason"
        :group-options="groupOptions"
        @remove="removeRow(i)"
      />
      <UiButton variant="outline" size="sm" @click="addRow">
        <UiIcon :icon="Plus" :size="14" /> {{ t('students.form.addPeriod') }}
      </UiButton>
    </div>
    <p class="text-xs text-muted-foreground">{{ t('students.form.discountHint') }}</p>
    <p v-if="!usePeriods" class="text-xs text-muted-foreground">{{ t('students.form.discountChangeHint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput, UiCheckbox, UiButton, UiIcon, UiSelect } from '@/shared/components'
import { Plus } from '@/shared/icons'
import StudentDiscountPeriodRow from './StudentDiscountPeriodRow.vue'
import { emptyPeriod, type DiscountRow } from '../utils/student-discount'
import { DiscountType, DISCOUNT_TYPE_LABEL_KEYS } from '../enums/discount-type.enum'
import { useDiscountTypeOptions } from '../composables/use-discount-type-options'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()
const typeOptions = useDiscountTypeOptions()

/** The student's selected groups — a period can be limited to one of them. */
defineProps<{ groupOptions?: SelectOption[] }>()

const usePeriods = defineModel<boolean>('usePeriods', { default: false })
const type = defineModel<DiscountType>('type', { default: DiscountType.PERCENT })
const value = defineModel<string | number>('value', { default: '' })
const reason = defineModel<string>('reason', { default: '' })
const periods = defineModel<DiscountRow[]>('periods', { default: () => [] })

// Enabling period mode seeds one empty row and clears the simple fields.
watch(usePeriods, (on) => {
  if (on) {
    value.value = ''
    reason.value = ''
    if (!periods.value.length) periods.value = [emptyPeriod()]
  } else {
    periods.value = []
  }
})

function addRow() {
  periods.value = [...periods.value, emptyPeriod()]
}
function removeRow(index: number) {
  periods.value = periods.value.filter((_, i) => i !== index)
}
</script>
