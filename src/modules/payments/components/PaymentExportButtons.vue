<template>
  <div class="flex w-full flex-wrap gap-2 sm:w-auto">
    <UiButton
      class="flex-1 sm:flex-none"
      variant="secondary"
      :loading="exportingMonth"
      :disabled="exportingPeriod"
      @click="emit('month')"
    >
      <UiIcon :icon="FileSpreadsheet" :size="16" />
      {{ t('payments.export.month') }}
    </UiButton>
    <UiButton class="flex-1 sm:flex-none" variant="outline" :disabled="exportingMonth || exportingPeriod" @click="emit('period')">
      <UiIcon :icon="CalendarRange" :size="16" />
      {{ t('payments.export.period') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon } from '@/shared/components'
import { FileSpreadsheet, CalendarRange } from '@/shared/icons'

const { t } = useI18n()

defineProps<{ exportingMonth?: boolean; exportingPeriod?: boolean }>()
const emit = defineEmits<{ month: []; period: [] }>()
</script>
