<template>
  <p v-if="checking" class="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
    <UiSpinner :size="14" /> {{ t('schedule.conflict.checking') }}
  </p>

  <div v-else-if="messages.length" role="alert" class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
    <p class="font-semibold">{{ t('schedule.conflict.title') }}</p>
    <ul class="mt-1 list-disc space-y-0.5 pl-5">
      <li v-for="(message, i) in messages" :key="i">{{ message }}</li>
    </ul>
    <p class="mt-2 text-xs">{{ t('schedule.conflict.hint') }}</p>
  </div>

  <p v-else-if="free" class="rounded-md bg-success-soft px-3 py-2 text-sm text-success" aria-live="polite">
    {{ t('schedule.conflict.free') }}
  </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiSpinner } from '@/shared/components'

const { t } = useI18n()

defineProps<{
  checking: boolean
  /** Ready-to-show conflict lines; any entry blocks saving. */
  messages: string[]
  /** A check ran and found nothing. */
  free: boolean
}>()
</script>
