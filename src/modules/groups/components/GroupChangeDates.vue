<template>
  <div v-if="scheduleChanged || teacherChanged" class="grid gap-4 rounded-md bg-info-soft p-3 sm:grid-cols-2">
    <div v-if="scheduleChanged">
      <UiDatepicker
        :model-value="scheduleFrom"
        :enable-time="false"
        :label="t('groups.form.scheduleEffectiveFrom')"
        @update:model-value="emit('update:scheduleFrom', pick($event))"
      />
      <p class="mt-1 text-xs text-info">{{ t('groups.form.scheduleEffectiveFromHint') }}</p>
    </div>
    <div v-if="teacherChanged">
      <UiDatepicker
        :model-value="teacherFrom"
        :enable-time="false"
        :label="t('groups.form.teacherEffectiveFrom')"
        @update:model-value="emit('update:teacherFrom', pick($event))"
      />
      <p class="mt-1 text-xs text-info">{{ t('groups.form.teacherEffectiveFromHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiDatepicker } from '@/shared/components'

const { t } = useI18n()
defineProps<{
  scheduleChanged: boolean
  teacherChanged: boolean
  scheduleFrom: Date | null
  teacherFrom: Date | null
}>()
const emit = defineEmits<{ 'update:scheduleFrom': [Date | null]; 'update:teacherFrom': [Date | null] }>()

const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
