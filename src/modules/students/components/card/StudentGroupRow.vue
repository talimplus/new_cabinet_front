<template>
  <div class="flex flex-wrap items-center gap-2 border-t border-border py-2 first:border-t-0">
    <UiBadge variant="primary">{{ group.name }}</UiBadge>
    <span class="font-mono text-sm font-medium text-foreground">
      {{ formatSom(group.monthlyFee) }}
    </span>
    <span v-if="scheduleText" class="text-sm text-muted-foreground">· {{ scheduleText }}</span>

    <UiButton
      v-if="canTransfer"
      size="sm"
      variant="ghost"
      class="ms-auto"
      @click="emit('transfer', group)"
    >
      <UiIcon :icon="ArrowLeftRight" :size="16" />
      {{ t('students.transfer.action') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiButton, UiIcon } from '@/shared/components'
import { ArrowLeftRight } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import type { StudentSummaryGroup } from '../../interfaces/student-summary.interface'

const { t } = useI18n()

const props = defineProps<{ group: StudentSummaryGroup; canTransfer?: boolean }>()
const emit = defineEmits<{ transfer: [group: StudentSummaryGroup] }>()

/** "Dushanba 10:00, Chorshanba 10:00" — `startTime` arrives as "10:00:00". */
const scheduleText = computed(() =>
  (props.group.schedule ?? [])
    .map((s) => `${t(WEEK_DAY_LABEL_KEYS[s.day])} ${s.startTime?.slice(0, 5) ?? ''}`.trim())
    .join(', '),
)
</script>
