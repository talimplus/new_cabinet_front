<template>
  <div v-if="bonuses.length || advances.length" class="grid gap-4 sm:grid-cols-2">
    <div v-for="list in lists" :key="list.key" class="min-w-0 space-y-2">
      <p class="text-xs font-medium text-muted-foreground">{{ list.title }}</p>
      <ul v-if="list.items.length" class="divide-y divide-border rounded-md border border-border">
        <li v-for="item in list.items" :key="item.id" class="space-y-0.5 px-3 py-2">
          <div class="flex items-baseline justify-between gap-2">
            <span class="font-mono text-sm font-semibold text-foreground">{{ item.amount }}</span>
            <span class="font-mono text-xs text-muted-foreground">{{ item.date }}</span>
          </div>
          <p v-if="item.comment" class="text-xs break-words text-muted-foreground">{{ item.comment }}</p>
          <p v-if="item.note" class="text-xs text-muted-foreground">{{ item.note }}</p>
        </li>
      </ul>
      <p v-else class="text-xs text-muted-foreground">{{ t('teacherDashboard.salary.none') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import type { TeacherSalaryAdvance, TeacherSalaryBonus } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ bonuses: TeacherSalaryBonus[]; advances: TeacherSalaryAdvance[] }>()

/** Bonuses and advances of the month, each with its comment and the day it was written. */
const lists = computed(() => [
  {
    key: 'bonuses',
    title: t('teacherDashboard.salary.bonuses'),
    items: props.bonuses.map((b) => ({
      id: b.id, amount: `+${formatSom(b.amount)}`, date: formatDate(b.createdAt), comment: b.reason, note: '',
    })),
  },
  {
    key: 'advances',
    title: t('teacherDashboard.salary.advances'),
    items: props.advances.map((a) => ({
      id: a.id,
      amount: formatSom(a.amount),
      date: formatDate(a.createdAt),
      comment: a.comment,
      // Part of an advance may still be waiting for a later salary.
      note: a.appliedAmount < a.amount
        ? t('teacherDashboard.salary.advanceApplied', { applied: formatSom(a.appliedAmount) })
        : '',
    })),
  },
])
</script>
