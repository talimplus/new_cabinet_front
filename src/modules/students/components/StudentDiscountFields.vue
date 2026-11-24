<template>
  <div class="space-y-3">
    <UiCheckbox v-model="usePeriods" :label="t('students.form.byPeriods')" />

    <div class="space-y-2">
      <StudentDiscountPeriodRow
        v-for="(row, i) in rows"
        :key="i"
        v-model:type="row.type"
        v-model:value="row.value"
        v-model:group-id="row.groupId"
        v-model:from-month="row.fromMonth"
        v-model:to-month="row.toMonth"
        v-model:reason="row.reason"
        :permanent="!usePeriods"
        :group-options="groupOptions"
        @remove="rows = rows.filter((_, x) => x !== i)"
      />
      <UiButton variant="outline" size="sm" @click="rows = [...rows, emptyPeriod()]">
        <UiIcon :icon="Plus" :size="14" /> {{ t(usePeriods ? 'students.form.addPeriod' : 'students.form.addDiscount') }}
      </UiButton>
    </div>
    <p class="text-xs text-muted-foreground">{{ t('students.form.discountHint') }}</p>
    <p v-if="!usePeriods" class="text-xs text-muted-foreground">{{ t('students.form.discountChangeHint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCheckbox, UiButton, UiIcon } from '@/shared/components'
import { Plus } from '@/shared/icons'
import StudentDiscountPeriodRow from './StudentDiscountPeriodRow.vue'
import { emptyPeriod, type DiscountRow } from '../utils/student-discount'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

/** The student's selected groups — a discount can be limited to one of them. */
defineProps<{ groupOptions?: SelectOption[] }>()

const usePeriods = defineModel<boolean>('usePeriods', { default: false })
/** Permanent discounts — the same rows without months. */
const baseDiscounts = defineModel<DiscountRow[]>('baseDiscounts', { default: () => [] })
const periods = defineModel<DiscountRow[]>('periods', { default: () => [] })

const rows = computed<DiscountRow[]>({
  get: () => (usePeriods.value ? periods.value : baseDiscounts.value),
  set: (next) => {
    if (usePeriods.value) periods.value = next
    else baseDiscounts.value = next
  },
})

// Either mode opens with one empty row ready to fill.
watch(usePeriods, () => { if (!rows.value.length) rows.value = [emptyPeriod()] }, { immediate: true })
</script>
