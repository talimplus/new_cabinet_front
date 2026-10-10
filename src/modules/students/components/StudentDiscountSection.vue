<template>
  <div class="space-y-3 border-t border-border pt-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-foreground">{{ t('students.form.discountTitle') }}</h3>
      <UiSwitch v-model="enabled" :label="t('students.form.discountTitle')" />
    </div>

    <template v-if="enabled">
      <UiTabs :tabs="tabs" :model-value="tab" @update:model-value="tab = $event" />
      <StudentDiscountFields
        v-if="tab === 'discounts'"
        v-model:use-periods="usePeriods"
        v-model:type="type"
        v-model:value="value"
        v-model:reason="reason"
        v-model:periods="periods"
        :group-options="groupOptions"
      />
      <StudentFreeMonthsField v-else v-model:free-months="freeMonths" :window="freeWindow" :stored-months="storedFreeMonths" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSwitch, UiTabs } from '@/shared/components'
import StudentDiscountFields from './StudentDiscountFields.vue'
import StudentFreeMonthsField from './StudentFreeMonthsField.vue'
import { DiscountType } from '../enums/discount-type.enum'
import type { DiscountRow } from '../utils/student-discount'
import type { FreeWindow } from '../interfaces/student.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const { t } = useI18n()

defineProps<{
  /** The student's selected groups — a period can be limited to one of them. */
  groupOptions?: SelectOption[]
  freeWindow?: FreeWindow | null
  storedFreeMonths?: number
}>()

/** Off by default: nothing discount-related is sent until it is switched on. */
const enabled = defineModel<boolean>('enabled', { default: false })
const freeMonths = defineModel<number>('freeMonths', { default: 0 })
const usePeriods = defineModel<boolean>('usePeriods', { default: false })
const type = defineModel<DiscountType>('type', { default: DiscountType.PERCENT })
const value = defineModel<string | number>('value', { default: '' })
const reason = defineModel<string>('reason', { default: '' })
const periods = defineModel<DiscountRow[]>('periods', { default: () => [] })

const tabs: TabItem[] = [
  { key: 'discounts', labelKey: 'students.form.discountTabs.discounts' },
  { key: 'free', labelKey: 'students.form.discountTabs.free' },
]
const tab = ref('discounts')
</script>
