<template>
  <div v-if="feeChanged" class="space-y-2">
    <UiCheckbox
      :model-value="applyFeeNow"
      :label="t('groups.form.applyFeeNow')"
      @update:model-value="emit('update:applyFeeNow', $event)"
    />
    <p v-if="applyFeeNow" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
      {{ t('groups.form.feeApplyNowWarning', { fee: formatSom(currentFee) }) }}
    </p>
    <p v-else class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
      {{ t('groups.form.feeNextMonthHint', { month: nextMonthLabel }) }}
      <template v-if="currentFee !== null">
        {{ t('groups.form.feeCurrentMonth', { fee: formatSom(currentFee) }) }}
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiCheckbox } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'

const { t } = useI18n()

defineProps<{
  feeChanged: boolean
  applyFeeNow: boolean
  currentFee: number | null
  nextMonthLabel: string
}>()
const emit = defineEmits<{ 'update:applyFeeNow': [boolean] }>()
</script>
