<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <UiStatCard :label="t('absences.summary.absent')" :value="String(summary.absent)" :icon="UserX" tone="danger" />
    <UiStatCard :label="t('absences.summary.excused')" :value="String(summary.excused)" :icon="Info" tone="info" />
    <UiStatCard
      :label="t('absences.summary.notFollowedUp')"
      :value="String(summary.notFollowedUp)"
      :icon="PhoneCall"
      tone="warning"
      colored
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiStatCard } from '@/shared/components'
import { UserX, Info, PhoneCall } from '@/shared/icons'
import type { AbsenceSummary } from '../interfaces/absence.interface'

const { t } = useI18n()
defineProps<{ summary: AbsenceSummary }>()
</script>
