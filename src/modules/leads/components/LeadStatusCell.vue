<template>
  <UiSpinner v-if="loading" :size="16" />
  <UiDropdown v-else-if="canEdit && transitions.length" align="left">
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
import { UiBadge, UiDropdown, UiDropdownItem, UiSpinner } from '@/shared/components'
import {
  LeadStatus, LEAD_STATUS_LABEL_KEYS, LEAD_STATUS_VARIANTS, LEAD_STATUS_TRANSITIONS,
} from '../enums/lead-status.enum'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ status?: LeadStatus; canEdit?: boolean; loading?: boolean }>()
const emit = defineEmits<{ change: [status: LeadStatus] }>()

const labelKeys = LEAD_STATUS_LABEL_KEYS
const current = computed(() => props.status ?? LeadStatus.NEW)
const label = computed(() => t(LEAD_STATUS_LABEL_KEYS[current.value]))
const variant = computed(() => LEAD_STATUS_VARIANTS[current.value])
const transitions = computed(() => LEAD_STATUS_TRANSITIONS[current.value])
</script>
