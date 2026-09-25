<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-end gap-2">
      <div class="min-w-0 flex-1">
        <UiDatepicker
          :model-value="date"
          :label="t('payments.dialog.stopStudyDate')"
          :placeholder="t('payments.dialog.selectDate')"
          :disabled="disabled"
          @update:model-value="emit('calculate', pickDate($event))"
        />
      </div>
      <UiButton
        variant="outline"
        :loading="calculating"
        :disabled="disabled || !date"
        @click="emit('calculate', date)"
      >
        {{ t('payments.dialog.calculate') }}
      </UiButton>
    </div>

    <!-- Backing out of the recalculation frees the amount field again. -->
    <UiButton v-if="date" size="sm" variant="ghost" :disabled="disabled" @click="emit('clear')">
      {{ t('payments.dialog.clearDate') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton, UiDatepicker } from '@/shared/components'

const { t } = useI18n()

defineProps<{ date: Date | null; calculating?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ calculate: [date: Date | null]; clear: [] }>()

const pickDate = (value: Date | Date[] | null): Date | null =>
  Array.isArray(value) ? (value[0] ?? null) : value
</script>
