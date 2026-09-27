<template>
  <!-- Two lines on desktop: what (type / value / subject) and when (months / reason). -->
  <div class="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 md:grid-cols-12 md:items-end">
    <div class="md:col-span-3">
      <UiSelect v-model="type" :options="typeOptions" :label="t('students.form.discountType')" :searchable="false" :clearable="false" />
    </div>
    <div class="md:col-span-3">
      <UiInput v-model="value" type="number" :label="t(DISCOUNT_TYPE_LABEL_KEYS[type])" />
    </div>
    <div class="col-span-2 md:col-span-6">
      <UiSelect
        :model-value="groupId"
        :options="groupOptions ?? []"
        :label="t('students.form.discountGroup')"
        :placeholder="t('students.form.allGroups')"
        @update:model-value="groupId = typeof $event === 'number' ? $event : null"
      />
    </div>
    <div class="md:col-span-3">
      <UiInput v-model="fromMonth" type="month" :label="t('students.form.fromMonthShort')" />
    </div>
    <div class="md:col-span-3">
      <UiInput v-model="toMonth" type="month" :label="t('students.form.toMonthShort')" />
    </div>
    <div class="col-span-2 md:col-span-5">
      <UiInput v-model="reason" :label="t('students.form.reason')" />
    </div>
    <div class="col-span-2 flex justify-end md:col-span-1">
      <UiIconButton :icon="Trash2" tone="danger" :label="t('students.form.removePeriod')" @click="emit('remove')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiInput, UiSelect, UiIconButton } from '@/shared/components'
import { Trash2 } from '@/shared/icons'
import { DiscountType, DISCOUNT_TYPE_LABEL_KEYS } from '../enums/discount-type.enum'
import { useDiscountTypeOptions } from '../composables/use-discount-type-options'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()
const typeOptions = useDiscountTypeOptions()

defineProps<{ groupOptions?: SelectOption[] }>()

const type = defineModel<DiscountType>('type', { default: DiscountType.PERCENT })
const value = defineModel<string | number>('value', { default: '' })
const groupId = defineModel<number | null>('groupId', { default: null })
const fromMonth = defineModel<string>('fromMonth', { default: '' })
const toMonth = defineModel<string>('toMonth', { default: '' })
const reason = defineModel<string>('reason', { default: '' })
const emit = defineEmits<{ remove: [] }>()
</script>
