<template>
  <div class="space-y-3 border-t border-border pt-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-foreground">{{ t('students.form.discountTitle') }}</h3>
      <UiCheckbox v-model="usePeriods" :label="t('students.form.byPeriods')" />
    </div>

    <div v-if="!usePeriods" class="grid gap-3 sm:grid-cols-2">
      <UiInput v-model="percent" type="number" :label="t('students.form.discountPercentShort')" />
      <UiInput v-model="reason" :label="t('students.form.reason')" />
    </div>

    <div v-else class="space-y-2">
      <StudentDiscountPeriodRow
        v-for="(row, i) in periods"
        :key="i"
        v-model:percent="row.percent"
        v-model:from-month="row.fromMonth"
        v-model:to-month="row.toMonth"
        v-model:reason="row.reason"
        @remove="removeRow(i)"
      />
      <UiButton variant="outline" size="sm" @click="addRow">
        <UiIcon :icon="Plus" :size="14" /> {{ t('students.form.addPeriod') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { UiInput, UiCheckbox, UiButton, UiIcon } from '@/shared/components'
import { Plus } from '@/shared/icons'
import StudentDiscountPeriodRow from './StudentDiscountPeriodRow.vue'
import { emptyPeriod, type DiscountRow } from '../composables/use-student-form'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const usePeriods = defineModel<boolean>('usePeriods', { default: false })
const percent = defineModel<string | number>('percent', { default: '' })
const reason = defineModel<string>('reason', { default: '' })
const periods = defineModel<DiscountRow[]>('periods', { default: () => [] })

// Enabling period mode seeds one empty row and clears the simple fields.
watch(usePeriods, (on) => {
  if (on) {
    percent.value = ''
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
