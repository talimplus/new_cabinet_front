<template>
  <!-- `contents`: both pickers join the parent form grid as separate cells. -->
  <div class="contents">
    <UiDatepicker
      :model-value="startDate"
      :enable-time="false"
      :min-date="branding.openedOn"
      :label="t('groups.form.startDate')"
      :hint="t('groups.form.startDateHint')"
      :error="errors.startDate"
      @update:model-value="emit('update:startDate', pick($event))"
    />
    <UiDatepicker
      :model-value="endDate"
      :enable-time="false"
      :label="t('groups.form.endDate')"
      :hint="t('groups.form.endDateHint')"
      :error="errors.endDate"
      @update:model-value="emit('update:endDate', pick($event))"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiDatepicker } from '@/shared/components'
import { useBrandingStore } from '@/stores/branding.store'

const { t } = useI18n()
/** No start before the organization joined — the backend 422s it too. */
const branding = useBrandingStore()

defineProps<{ startDate: Date | null; endDate: Date | null; errors: Record<string, string> }>()
const emit = defineEmits<{ 'update:startDate': [Date | null]; 'update:endDate': [Date | null] }>()

const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
