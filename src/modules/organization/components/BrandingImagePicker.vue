<template>
  <div>
    <p class="text-sm font-semibold text-foreground">{{ label }}</p>
    <p class="mt-0.5 text-xs text-muted-foreground">{{ hint }}</p>

    <div
      class="mt-2 grid place-items-center rounded-lg border border-dashed border-border bg-surface-muted p-3"
      :class="variant === 'favicon' ? 'h-24 w-24' : 'h-24'"
    >
      <img v-if="modelValue" :src="modelValue" :alt="label" class="max-h-full max-w-full object-contain" />
      <span v-else class="flex flex-col items-center gap-1 text-xs text-muted-foreground">
        <UiIcon :icon="ImageOff" :size="20" />
        {{ t('organization.noImage') }}
      </span>
    </div>

    <div class="mt-2 flex flex-wrap gap-2">
      <UiButton size="sm" variant="outline" @click="fileInput?.click()">
        <UiIcon :icon="Upload" :size="16" /> {{ t('organization.upload') }}
      </UiButton>
      <UiButton v-if="modelValue" size="sm" variant="ghost" @click="emit('update:modelValue', '')">
        <UiIcon :icon="Trash2" :size="16" /> {{ t('organization.remove') }}
      </UiButton>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon } from '@/shared/components'
import { Upload, Trash2, ImageOff } from '@/shared/icons'

const { t } = useI18n()

defineProps<{
  modelValue: string
  label: string
  hint: string
  accept: string
  variant: 'logo' | 'favicon'
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; pick: [file: File] }>()

const fileInput = ref<HTMLInputElement | null>(null)

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-picking the same file
  if (file) emit('pick', file)
}
</script>
