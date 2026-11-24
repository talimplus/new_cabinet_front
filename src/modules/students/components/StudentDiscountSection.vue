<template>
  <div class="space-y-3 border-t border-border pt-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-foreground">{{ t('students.form.discountTitle') }}</h3>
      <UiSwitch :model-value="enabled" :label="t('students.form.discountTitle')" @update:model-value="toggle" />
    </div>

    <template v-if="enabled">
      <UiTabs :tabs="tabs" :model-value="tab" @update:model-value="tab = $event" />
      <StudentDiscountFields
        v-if="tab === 'discounts'"
        v-model:use-periods="usePeriods"
        v-model:base-discounts="baseDiscounts"
        v-model:periods="periods"
        :group-options="groupOptions"
      />
      <StudentFreeMonthsField v-else v-model:free-months="freeMonths" :window="freeWindow" :stored-months="storedFreeMonths" />
      <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    </template>
    <p v-else-if="confirmOff" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
      {{ t('students.form.discountOffPending') }}
    </p>

    <!-- Own dialog, not the app-wide one: that one is teleported earlier and would open under the form. -->
    <UiConfirmDialog
      v-model="confirmOpen"
      :title="t('students.form.discountOffTitle')"
      :message="t('students.form.discountOffMessage')"
      :confirm-label="t('students.form.discountOffConfirm')"
      @confirm="turnOff"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSwitch, UiTabs, UiConfirmDialog } from '@/shared/components'
import StudentDiscountFields from './StudentDiscountFields.vue'
import StudentFreeMonthsField from './StudentFreeMonthsField.vue'
import type { DiscountRow } from '../utils/student-discount'
import type { FreeWindow } from '../interfaces/student.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const { t } = useI18n()

const props = defineProps<{
  /** The student's selected groups — a discount can be limited to one of them. */
  groupOptions?: SelectOption[]
  freeWindow?: FreeWindow | null
  storedFreeMonths?: number
  /** The student has a discount: switching off rebills this month, so it is confirmed. */
  confirmOff?: boolean
  error?: string
}>()

/** Off by default: nothing discount-related is sent until it is switched on. */
const enabled = defineModel<boolean>('enabled', { default: false })
const freeMonths = defineModel<number>('freeMonths', { default: 0 })
const usePeriods = defineModel<boolean>('usePeriods', { default: false })
const baseDiscounts = defineModel<DiscountRow[]>('baseDiscounts', { default: () => [] })
const periods = defineModel<DiscountRow[]>('periods', { default: () => [] })

const tabs: TabItem[] = [
  { key: 'discounts', labelKey: 'students.form.discountTabs.discounts' },
  { key: 'free', labelKey: 'students.form.discountTabs.free' },
]
const tab = ref('discounts')
const confirmOpen = ref(false)

function toggle(on: boolean): void {
  if (!on && props.confirmOff) confirmOpen.value = true
  else enabled.value = on
}
function turnOff(): void {
  confirmOpen.value = false
  enabled.value = false
}
</script>
