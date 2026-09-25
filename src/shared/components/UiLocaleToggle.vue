<template>
  <UiDropdown align="right">
    <template #trigger>
      <button
        type="button"
        class="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
        :aria-label="t('layout.language')"
      >
        <UiIcon :icon="Languages" :size="18" />
        <span class="uppercase">{{ locale }}</span>
      </button>
    </template>
    <UiDropdownItem
      v-for="option in options"
      :key="option.value"
      @click="choose(option.value)"
    >
      <UiIcon v-if="option.value === locale" :icon="Check" :size="16" />
      <span :class="option.value === locale ? 'font-semibold' : 'ps-6'">{{ option.label }}</span>
    </UiDropdownItem>
  </UiDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiDropdown from './UiDropdown.vue'
import UiDropdownItem from './UiDropdownItem.vue'
import UiIcon from './UiIcon.vue'
import { Languages, Check } from '@/shared/icons'
import { AppLocale } from '@/shared/enums/app-locale.enum'
import { setLocale } from '@/locales'

const { t, locale } = useI18n()

const options = computed(() => [
  { value: AppLocale.UZ, label: t('layout.uzbek') },
  { value: AppLocale.RU, label: t('layout.russian') },
])

function choose(value: AppLocale) {
  setLocale(value)
}
</script>
