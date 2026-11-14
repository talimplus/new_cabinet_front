<template>
  <!-- Hired: either already an employee (link to their page) or still to be added to staff. -->
  <div class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
    <span class="text-sm text-muted-foreground">{{ t('candidates.table.status') }}:</span>
    <span class="inline-flex"><CandidateStatusCell :candidate="candidate" :can-edit="canManage" :loading="loading" @change="emit('status', $event)" /></span>
    <span class="text-sm text-muted-foreground">· {{ t(positionKeys[candidate.position]) }}</span>
    <RouterLink
      v-if="candidate.hiredUserId && canViewStaff"
      :to="`/users/${candidate.hiredUserId}`"
      class="ml-auto text-sm font-semibold text-primary hover:underline"
    >
      {{ t('candidates.hire.openEmployee') }}
    </RouterLink>
    <UiButton
      v-else-if="!candidate.hiredUserId && candidate.status === CandidateStatus.HIRED && canManage && canHire"
      class="ml-auto" size="sm" @click="emit('hire')"
    >
      <UiIcon :icon="UserPlus" :size="16" /> {{ t('candidates.hire.action') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { UiButton, UiIcon } from '@/shared/components'
import { UserPlus } from '@/shared/icons'
import { CandidateStatus } from '../enums/candidate-status.enum'
import { CANDIDATE_POSITION_LABEL_KEYS as positionKeys } from '../enums/candidate-position.enum'
import type { Candidate } from '../interfaces/candidate.interface'
import CandidateStatusCell from './CandidateStatusCell.vue'

const { t } = useI18n()
defineProps<{
  candidate: Candidate
  canManage?: boolean
  /** `users.create` — may turn the candidate into an employee. */
  canHire?: boolean
  canViewStaff?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{ status: [status: CandidateStatus]; hire: [] }>()
</script>
