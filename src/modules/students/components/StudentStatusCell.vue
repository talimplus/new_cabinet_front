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
  StudentStatus, STUDENT_STATUS_LABEL_KEYS, STUDENT_STATUS_VARIANTS, STUDENT_STATUS_TRANSITIONS,
} from '../enums/student-status.enum'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ status: StudentStatus; canEdit?: boolean; loading?: boolean }>()
const emit = defineEmits<{ change: [status: StudentStatus] }>()

const labelKeys = STUDENT_STATUS_LABEL_KEYS
const current = computed(() => props.status ?? StudentStatus.NEW)
const label = computed(() => t(STUDENT_STATUS_LABEL_KEYS[current.value]))
const variant = computed(() => STUDENT_STATUS_VARIANTS[current.value])
const transitions = computed(() => STUDENT_STATUS_TRANSITIONS[current.value])
</script>
