<template>
  <button
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-muted"
    :aria-label="t('common.theme')"
    @click="toggle"
  >
    <Moon v-if="isDark" :size="18" />
    <Sun v-else :size="18" />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from '@/shared/icons'
import { useTheme } from '@/shared/composables/use-theme'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { isDark, toggle } = useTheme()
</script>
