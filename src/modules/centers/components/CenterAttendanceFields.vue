<template>
  <div class="space-y-3 border-t border-border pt-4">
    <div>
      <h3 class="text-sm font-semibold text-foreground">{{ t('centers.attendance.title') }}</h3>
      <p class="mt-1 text-xs text-muted-foreground">{{ t('centers.attendance.hint') }}</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <UiInput v-model="latitude" type="number" :label="t('centers.attendance.latitude')" />
      <UiInput v-model="longitude" type="number" :label="t('centers.attendance.longitude')" />
    </div>

    <UiButton variant="outline" size="sm" :loading="geoLoading" @click="emit('useLocation')">
      <UiIcon :icon="LocateFixed" :size="16" /> {{ t('centers.attendance.useMyLocation') }}
    </UiButton>

    <UiInput
      v-model="checkInRadiusMeters"
      type="number"
      :label="t('centers.attendance.radius')"
      :hint="t('centers.attendance.radiusHint')"
    />

    <UiInput
      v-model="publicIp"
      :label="t('centers.attendance.publicIp')"
      :hint="t('centers.attendance.publicIpHint')"
    />

    <UiButton variant="outline" size="sm" :loading="ipLoading" @click="emit('captureIp')">
      <UiIcon :icon="Wifi" :size="16" /> {{ t('centers.attendance.captureIp') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiInput, UiButton, UiIcon } from '@/shared/components'
import { LocateFixed, Wifi } from '@/shared/icons'

const { t } = useI18n()

interface Props {
  geoLoading?: boolean
  ipLoading?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ useLocation: []; captureIp: [] }>()

const latitude = defineModel<number | ''>('latitude', { required: true })
const longitude = defineModel<number | ''>('longitude', { required: true })
const checkInRadiusMeters = defineModel<number | ''>('checkInRadiusMeters', { required: true })
const publicIp = defineModel<string>('publicIp', { required: true })
</script>
