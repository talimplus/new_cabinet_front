<template>
  <div class="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
    <span
      class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-lg font-bold text-on-primary-soft"
    >
      {{ initials }}
    </span>

    <div class="min-w-0">
      <h2 class="truncate text-lg font-semibold text-foreground">{{ fullName }}</h2>
      <p class="truncate text-sm text-muted-foreground">
        {{ t('students.view.card.phone') }}: {{ student?.phone || '—' }}
      </p>
    </div>

    <UiBadge v-if="student" :variant="STUDENT_STATUS_VARIANTS[student.status]">
      {{ t(STUDENT_STATUS_LABEL_KEYS[student.status]) }}
    </UiBadge>

    <div class="ms-auto flex flex-wrap items-center gap-4">
      <div class="text-right">
        <p class="text-xs text-muted-foreground">{{ t('students.view.card.monthlyFee') }}</p>
        <p class="font-mono text-lg font-semibold text-foreground">
          {{ formatSom(student?.monthlyFee ?? 0) }}
        </p>
      </div>
      <UiButton v-if="canEdit" variant="outline" :loading="editLoading" @click="emit('edit')">
        <UiIcon :icon="Pencil" :size="16" />
        {{ t('common.edit') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiButton, UiIcon } from '@/shared/components'
import { Pencil } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import {
  STUDENT_STATUS_LABEL_KEYS,
  STUDENT_STATUS_VARIANTS,
} from '../../enums/student-status.enum'
import type { StudentSummaryProfile } from '../../interfaces/student-summary.interface'

const { t } = useI18n()

const props = defineProps<{
  student: StudentSummaryProfile | null
  canEdit?: boolean
  editLoading?: boolean
}>()
const emit = defineEmits<{ edit: [] }>()

const fullName = computed(() =>
  props.student ? `${props.student.firstName} ${props.student.lastName}`.trim() : '',
)
const initials = computed(() =>
  `${props.student?.firstName?.[0] ?? ''}${props.student?.lastName?.[0] ?? ''}`.toUpperCase(),
)
</script>
