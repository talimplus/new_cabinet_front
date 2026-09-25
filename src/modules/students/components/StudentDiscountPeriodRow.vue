<template>
  <div class="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 md:grid-cols-9 md:items-end">
    <div class="md:col-span-2">
      <UiInput v-model="percent" type="number" :label="t('students.form.percentShort')" />
    </div>
    <div class="md:col-span-2">
      <UiInput v-model="fromMonth" type="month" :label="t('students.form.fromMonthShort')" />
    </div>
    <div class="md:col-span-2">
      <UiInput v-model="toMonth" type="month" :label="t('students.form.toMonthShort')" />
    </div>
    <div class="md:col-span-2">
      <UiInput v-model="reason" :label="t('students.form.reason')" />
    </div>
    <div class="flex justify-end">
      <button type="button" class="rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-danger" @click="emit('remove')">
        <UiIcon :icon="Trash2" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiInput, UiIcon } from '@/shared/components'
import { Trash2 } from '@/shared/icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const percent = defineModel<string | number>('percent', { default: '' })
const fromMonth = defineModel<string>('fromMonth', { default: '' })
const toMonth = defineModel<string>('toMonth', { default: '' })
const reason = defineModel<string>('reason', { default: '' })
const emit = defineEmits<{ remove: [] }>()
</script>
