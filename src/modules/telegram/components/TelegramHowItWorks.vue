<template>
  <section class="rounded-lg border border-border bg-surface-muted p-5">
    <h3 class="text-sm font-semibold text-foreground">{{ t('telegram.settings.howTitle') }}</h3>
    <ol class="mt-2 space-y-1 text-sm text-muted-foreground">
      <li>1. {{ t('telegram.settings.how1') }}</li>
      <li>2. {{ t('telegram.settings.how2') }}</li>
      <li>3. {{ t('telegram.settings.how3') }}</li>
      <li>4. {{ t('telegram.settings.how4') }}</li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
