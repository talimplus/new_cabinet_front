<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-6">
    <dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <div v-for="f in fields" :key="f.key" class="min-w-0" :class="f.wide && 'sm:col-span-2'">
        <dt class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <UiIcon :icon="f.icon" :size="14" /> {{ t(`candidates.detail.${f.key}`) }}
        </dt>
        <dd
          class="mt-1 break-words text-sm text-foreground"
          :class="[f.mono && 'font-mono', f.wide && 'whitespace-pre-line leading-relaxed']"
        >
          {{ f.value || '—' }}
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon } from '@/shared/components'
import { Phone, Calendar, BookOpen, Briefcase, MapPin, MessageSquare, CalendarDays } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import { formatPhone } from '@/shared/utils/format-phone'
import type { Candidate } from '../interfaces/candidate.interface'
import { CANDIDATE_POSITION_LABEL_KEYS } from '../enums/candidate-position.enum'

const props = defineProps<{ candidate: Candidate }>()
const { t } = useI18n()

const fields = computed(() => {
  const c = props.candidate
  const age = c.birthYear ? new Date().getFullYear() - c.birthYear : null
  return [
    { key: 'phone', icon: Phone, value: formatPhone(c.phone), mono: true },
    {
      key: 'birthYear', icon: Calendar, mono: true,
      value: c.birthYear ? `${c.birthYear} (${t('candidates.detail.age', { age })})` : '',
    },
    { key: 'position', icon: Briefcase, value: t(CANDIDATE_POSITION_LABEL_KEYS[c.position]) },
    { key: 'subject', icon: BookOpen, value: c.subject?.name },
    { key: 'createdAt', icon: CalendarDays, value: formatDate(c.createdAt), mono: true },
    { key: 'experience', icon: Briefcase, value: c.experience, wide: true },
    { key: 'address', icon: MapPin, value: c.address, wide: true },
    { key: 'comment', icon: MessageSquare, value: c.comment, wide: true },
  ]
})
</script>
