<template>
  <div class="w-full rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
    <p class="font-medium">{{ t('students.stopInfo.date', { date: formatDate(info.date) }) }}</p>
    <p class="text-xs">{{ t('students.stopInfo.explain', { date: formatDate(info.date) }) }}</p>
    <p v-if="marked" class="text-xs">{{ marked }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/shared/utils/format-date'
import type { StudentStopInfo } from '../../interfaces/student-summary.interface'

/** Since when the student is stopped, and when it was recorded (may be later). */
const { t } = useI18n()
const props = defineProps<{ info: StudentStopInfo }>()

const marked = computed(() => {
  const { markedOn, markedBy } = props.info
  if (!markedOn) return ''
  const date = formatDate(markedOn)
  return markedBy
    ? t('students.stopInfo.markedBy', { date, name: markedBy })
    : t('students.stopInfo.marked', { date })
})
</script>
