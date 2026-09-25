<template>
  <div class="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-3">
    <UiBadge variant="primary">
      <UiIcon :icon="BookOpen" :size="14" />{{ syllabusName }}
    </UiBadge>
    <UiBadge v-if="totalLessons" variant="neutral">
      {{ t('groups.plan.lessons') }}:&nbsp;<span class="font-mono">{{ totalLessons }}</span>
    </UiBadge>
    <UiBadge v-if="horizonDate" variant="neutral">
      {{ t('groups.plan.finish') }}:&nbsp;<span class="font-mono">{{ formatDate(horizonDate) }}</span>
    </UiBadge>

    <div v-if="canEdit" class="ms-auto flex flex-wrap gap-2">
      <UiButton size="sm" variant="secondary" @click="emit('distribute')">
        <UiIcon :icon="RefreshCw" :size="14" />{{ t('groups.plan.distribute') }}
      </UiButton>
      <UiButton size="sm" variant="outline" @click="emit('replace')">{{ t('groups.plan.replace') }}</UiButton>
      <UiButton size="sm" variant="ghost" @click="emit('detach')">{{ t('groups.plan.detach') }}</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiBadge, UiButton, UiIcon } from '@/shared/components'
import { BookOpen, RefreshCw } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  syllabusName: string
  totalLessons: number | null
  horizonDate: string | null
  canEdit?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ distribute: []; replace: []; detach: [] }>()
</script>
