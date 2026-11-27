<template>
  <p v-if="isCurrent" class="flex items-start gap-2 rounded-md bg-info-soft px-3 py-2 text-sm text-info">
    <UiIcon :icon="Info" :size="16" class="mt-0.5 shrink-0" />
    {{ t('payroll.banner', { month: monthName(forMonth) }) }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon } from '@/shared/components'
import { Info } from '@/shared/icons'
import { monthName } from '../utils/payroll-salary'

const { t } = useI18n()
/** `forMonth` — "YYYY-MM"; the banner shows only for the month still running. */
const props = defineProps<{ forMonth: string }>()

const isCurrent = computed(() => {
  const now = new Date()
  return props.forMonth === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})
</script>
