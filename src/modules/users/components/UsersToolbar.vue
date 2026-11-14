<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="min-w-0 flex-1 sm:max-w-xs">
      <UiInput type="search" :model-value="name" :placeholder="t('users.filter.namePlaceholder')" @input="onName">
        <template #prefix><UiIcon :icon="Search" :size="16" /></template>
      </UiInput>
    </div>
    <div class="min-w-0 flex-1 sm:max-w-xs">
      <UiInput type="search" :model-value="phone" :placeholder="t('users.filter.phonePlaceholder')" @input="onPhone" />
    </div>
    <UiButton v-if="canCreate" class="ml-auto" @click="emit('create')">
      <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton, UiInput, UiIcon } from '@/shared/components'
import { Plus, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'

const { t } = useI18n()

defineProps<{ name: string; phone: string; canCreate?: boolean }>()
const emit = defineEmits<{ name: [value: string]; phone: [value: string]; create: [] }>()

const onName = debounce((e: Event) => emit('name', (e.target as HTMLInputElement).value))
const onPhone = debounce((e: Event) => emit('phone', (e.target as HTMLInputElement).value))
</script>
