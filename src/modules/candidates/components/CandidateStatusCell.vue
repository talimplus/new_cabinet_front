<template>
  <UiSpinner v-if="loading" :size="16" />
  <!-- Transferred to staff — the status is final. -->
  <UiDropdown v-else-if="canEdit && !candidate.hiredUserId" align="left">
    <template #trigger>
      <button type="button"><UiBadge :variant="variants[candidate.status]">{{ t(labelKeys[candidate.status]) }} ▾</UiBadge></button>
    </template>
    <UiDropdownItem v-for="s in options" :key="s" @click="emit('change', s)">
      <span class="h-2 w-2 rounded-full" :class="DOT[variants[s]]" /> {{ t(labelKeys[s]) }}
    </UiDropdownItem>
  </UiDropdown>
  <UiBadge v-else :variant="variants[candidate.status]">{{ t(labelKeys[candidate.status]) }}</UiBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiDropdown, UiDropdownItem, UiSpinner } from '@/shared/components'
import {
  CandidateStatus, CANDIDATE_STATUS_LABEL_KEYS, CANDIDATE_STATUS_VARIANTS,
} from '../enums/candidate-status.enum'
import type { Candidate } from '../interfaces/candidate.interface'

const { t } = useI18n()

const props = defineProps<{ candidate: Candidate; canEdit?: boolean; loading?: boolean }>()
const emit = defineEmits<{ change: [status: CandidateStatus] }>()

const labelKeys = CANDIDATE_STATUS_LABEL_KEYS
const variants = CANDIDATE_STATUS_VARIANTS
const DOT: Record<string, string> = {
  neutral: 'bg-muted-foreground', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger',
}
/** "Hired" stays pickable while not yet transferred — it re-asks to add to staff. */
const options = computed(() =>
  Object.values(CandidateStatus).filter(
    (s) => s !== props.candidate.status || s === CandidateStatus.HIRED,
  ),
)
</script>
