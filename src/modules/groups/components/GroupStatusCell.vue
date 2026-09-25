<template>
  <UiDropdown v-if="canEdit && transitions.length" align="left">
    <template #trigger>
      <button type="button"><UiBadge :variant="variant">{{ label }} ▾</UiBadge></button>
    </template>
    <UiDropdownItem v-for="s in transitions" :key="s" @click="emit('change', s)">
      {{ t(labelKeys[s]) }}
    </UiDropdownItem>
  </UiDropdown>
  <UiBadge v-else :variant="variant">{{ label }}</UiBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiDropdown, UiDropdownItem } from '@/shared/components'
import { GroupStatus, GROUP_STATUS_LABEL_KEYS, GROUP_STATUS_TRANSITIONS } from '../enums/group-status.enum'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ status?: GroupStatus; canEdit?: boolean }>()
const emit = defineEmits<{ change: [status: GroupStatus] }>()

const labelKeys = GROUP_STATUS_LABEL_KEYS
const variants: Record<GroupStatus, 'info' | 'success' | 'neutral'> = {
  [GroupStatus.NEW]: 'info',
  [GroupStatus.STARTED]: 'success',
  [GroupStatus.FINISHED]: 'neutral',
}

const current = computed(() => props.status ?? GroupStatus.NEW)
const label = computed(() => t(GROUP_STATUS_LABEL_KEYS[current.value]))
const variant = computed(() => variants[current.value])
const transitions = computed(() => GROUP_STATUS_TRANSITIONS[current.value])
</script>
