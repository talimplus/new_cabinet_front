<template>
  <div class="space-y-4 rounded-lg border border-border bg-surface p-4 shadow-card">
    <h3 class="text-base font-semibold text-foreground">{{ t('students.view.info.title') }}</h3>

    <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="field in fields" :key="field.label">
        <dt class="text-xs text-muted-foreground">{{ field.label }}</dt>
        <dd class="text-sm text-foreground">{{ field.value }}</dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">{{ t('students.view.info.preferredDays') }}</dt>
        <dd class="mt-1 flex flex-wrap gap-1">
          <UiBadge v-for="day in student?.preferredDays ?? []" :key="day">
            {{ t(WEEK_DAY_LABEL_KEYS[day]) }}
          </UiBadge>
          <span v-if="!student?.preferredDays?.length" class="text-sm text-foreground">—</span>
        </dd>
      </div>
    </dl>

    <div>
      <p class="text-xs text-muted-foreground">{{ t('students.view.info.groups') }}</p>
      <div v-if="student?.groups?.length" class="mt-1">
        <StudentGroupRow
          v-for="group in student.groups"
          :key="group.id"
          :group="group"
          :can-transfer="canTransfer"
          @transfer="emit('transfer', $event)"
        />
      </div>
      <p v-else class="text-sm text-muted-foreground">{{ t('students.view.info.noGroups') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import { PREFERRED_TIME_LABEL_KEYS } from '../../enums/student-preferred-time.enum'
import StudentGroupRow from './StudentGroupRow.vue'
import { formatDiscount } from '../../utils/format-discount'
import type {
  StudentSummaryGroup,
  StudentSummaryProfile,
} from '../../interfaces/student-summary.interface'

const { t } = useI18n()

const props = defineProps<{ student: StudentSummaryProfile | null; canTransfer?: boolean }>()
const emit = defineEmits<{ transfer: [group: StudentSummaryGroup] }>()

const fields = computed(() => {
  const s = props.student
  const time = s?.preferredTime
  const discount = formatDiscount(s?.discountPercent, s?.discountAmount)
  return [
    { label: t('students.view.info.subject'), value: s?.subject?.name || '—' },
    { label: t('students.view.info.center'), value: s?.centerName || '—' },
    { label: t('students.view.info.birthDate'), value: formatDate(s?.birthDate) },
    { label: t('students.view.info.preferredTime'), value: time ? t(PREFERRED_TIME_LABEL_KEYS[time]) : '—' },
    { label: t('students.view.info.discount'), value: discount ?? '—' },
  ]
})
</script>
