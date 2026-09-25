<template>
  <div class="space-y-3 border-t border-border pt-4">
    <div class="flex gap-1 rounded-lg bg-surface-muted p-1">
      <button
        v-for="item in tabs"
        :key="item.value"
        type="button"
        :class="[
          'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          tab === item.value ? 'bg-surface text-foreground shadow-card' : 'text-muted-foreground',
        ]"
        @click="tab = item.value"
      >
        {{ t(item.labelKey) }}
      </button>
    </div>

    <div v-if="tab === 'passport'" class="grid gap-3 sm:grid-cols-2">
      <UiInput v-model="passportSeries" :label="t('leads.form.passportSeries')" placeholder="AA" />
      <UiInput v-model="passportNumber" :label="t('leads.form.passportNumber')" placeholder="1234567" />
    </div>
    <UiInput v-else v-model="jshshir" :label="t('leads.form.jshshir')" :placeholder="t('leads.form.jshshirPlaceholder')" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UiInput } from '@/shared/components'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const passportSeries = defineModel<string>('passportSeries', { default: '' })
const passportNumber = defineModel<string>('passportNumber', { default: '' })
const jshshir = defineModel<string>('jshshir', { default: '' })

const tabs = [
  { value: 'passport' as const, labelKey: 'leads.form.passport' },
  { value: 'jshshir' as const, labelKey: 'leads.form.jshshir' },
]
const tab = ref<'passport' | 'jshshir'>(jshshir.value ? 'jshshir' : 'passport')

watch(() => jshshir.value, (v) => { if (v && tab.value !== 'jshshir') tab.value = 'jshshir' })
watch(tab, (value) => {
  if (value === 'passport') jshshir.value = ''
  else { passportSeries.value = ''; passportNumber.value = '' }
})
</script>
