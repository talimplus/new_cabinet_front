<template>
  <div :class="disabled && 'opacity-50'">
    <UiCheckbox v-model="model" :label="label" :disabled="disabled" />
    <p class="ms-[30px] mt-1 text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { UiCheckbox } from '@/shared/components'

interface Props {
  label: string
  hint: string
  disabled?: boolean
}
defineProps<Props>()
const model = defineModel<boolean>({ required: true })
</script>
