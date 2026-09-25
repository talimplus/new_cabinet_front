<template>
  <div v-if="days.length" class="flex flex-wrap gap-1">
    <UiBadge v-for="d in days" :key="d" variant="primary">{{ t(WEEK_DAY_SHORT_KEYS[d]) }}</UiBadge>
  </div>
  <span v-else class="text-muted-foreground">—</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/shared/components'
import { WEEK_DAY_SHORT_KEYS } from '@/modules/groups/enums/week-day.enum'
import type { WeekDay } from '@/modules/groups/enums/week-day.enum'

const { t } = useI18n()

const props = defineProps<{ days?: WeekDay[] }>()
const days = computed(() => props.days ?? [])
</script>
