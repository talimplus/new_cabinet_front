<template>
  <!-- Avans / Mukofot from the list: no payroll row is needed (start of month, 0 commission yet). -->
  <UiIconButton :icon="HandCoins" tone="primary" :label="t('payroll.extras.advanceTitle')" @click="emit('advance')" />
  <UiIconButton :icon="Gift" tone="success" :label="t('payroll.extras.bonusTitle')" @click="emit('bonus')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiIconButton } from '@/shared/components'
import { Gift, HandCoins } from '@/shared/icons'

const { t } = useI18n()
const emit = defineEmits<{ advance: []; bonus: [] }>()
</script>
