<template>
  <div class="flex flex-wrap gap-2">
    <UiButton
      variant="secondary"
      :loading="exportingMonth"
      :disabled="exportingPeriod"
      @click="emit('month')"
    >
      <UiIcon :icon="FileSpreadsheet" :size="16" />
      {{ t('payments.export.month') }}
    </UiButton>
    <UiButton variant="outline" :disabled="exportingMonth || exportingPeriod" @click="emit('period')">
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
