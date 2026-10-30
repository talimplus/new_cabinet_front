<template>
  <div class="rounded-md border border-border p-3">
    <p class="text-sm font-semibold text-foreground">{{ t('groups.start.candidatesTitle') }}</p>
    <p class="mt-0.5 text-xs text-muted-foreground">{{ t('groups.start.candidatesHint') }}</p>
    <ul class="mt-2 space-y-2">
      <li v-for="c in candidates" :key="c.studentId">
        <UiCheckbox
          :model-value="selected.includes(c.studentId)"
          :disabled="disabled"
          @update:model-value="emit('toggle', c.studentId, !!$event)"
        >
          {{ c.fullName }}
          <span class="text-xs text-muted-foreground">
            · {{ t('groups.start.joinedAt', { date: formatDate(c.joinedAt) }) }}
          </span>
        </UiCheckbox>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiCheckbox } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import type { GroupStartCandidate } from '../interfaces/group-start.interface'

const { t } = useI18n()

defineProps<{ candidates: GroupStartCandidate[]; selected: number[]; disabled?: boolean }>()
const emit = defineEmits<{ toggle: [studentId: number, on: boolean] }>()
</script>
