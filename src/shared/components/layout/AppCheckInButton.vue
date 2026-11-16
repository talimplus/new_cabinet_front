<template>
  <template v-if="visible && c.today.value">
    <UiButton
      v-if="!c.today.value.checkedIn"
      size="sm"
      :loading="c.submitting.value"
      :title="t('staffAttendance.card.geoNotice')"
      :aria-label="t('staffAttendance.card.checkInButton')"
      @click="c.submit"
    >
      <UiIcon :icon="MapPin" :size="16" />
      <span class="hidden sm:inline">{{ t('staffAttendance.card.checkInButton') }}</span>
    </UiButton>
    <span
      v-else
      class="hidden items-center gap-1 rounded-sm bg-success-soft px-2 py-1 text-xs font-medium text-success sm:inline-flex"
      :title="t('staffAttendance.card.checkedIn')"
    >
      <UiIcon :icon="CheckCircle2" :size="14" />
      <span class="font-mono">{{ arrivedAt }}</span>
    </span>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import UiButton from '../UiButton.vue'
import UiIcon from '../UiIcon.vue'
import { MapPin, CheckCircle2 } from '@/shared/icons'
import { useCheckIn } from '@/shared/composables/use-check-in'
import { usePermissions } from '@/shared/composables/use-permissions'

const { t } = useI18n()
const { isReception, canCheckIn } = usePermissions()
const c = useCheckIn()

/**
 * Reception's "Keldim" lives in the header — they have no `/today` page, and
 * the header is the first thing they see. Teachers keep the card on `/today`.
 * Base-role rule on purpose: the backend accepts check-in from teacher and
 * reception only (a manager with the key would get 403).
 */
const visible = computed(() => isReception.value && canCheckIn.value)
onMounted(() => {
  if (visible.value) void c.load()
})

const arrivedAt = computed(() => {
  const at = c.today.value?.attendance?.checkInAt
  return at ? new Date(at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''
})
</script>
