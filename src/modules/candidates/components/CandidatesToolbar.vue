<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="min-w-0 flex-1 sm:max-w-xs">
      <UiInput type="search" :model-value="c.filters.search" :placeholder="t('candidates.searchPlaceholder')" @input="onSearch">
        <template #prefix><UiIcon :icon="Search" :size="16" /></template>
      </UiInput>
    </div>
    <div class="w-full sm:w-44">
      <UiSelect
        :model-value="c.filters.status" :options="statuses" :placeholder="t('candidates.allStatuses')" :searchable="false" clearable
        @update:model-value="c.setStatus(($event as CandidateStatus | null) ?? null)"
      />
    </div>
    <div class="w-full sm:w-48">
      <UiSelect
        :model-value="c.filters.position" :options="positions" :placeholder="t('candidates.allPositions')" :searchable="false" clearable
        @update:model-value="c.setPosition(($event as CandidatePosition | null) ?? null)"
      />
    </div>
    <div class="w-full sm:w-48">
      <UiSelect
        :model-value="c.filters.subjectId" :options="c.subjects.value" :placeholder="t('candidates.allSubjects')" clearable
        @update:model-value="c.setSubject(($event as number | null) ?? null)"
      />
    </div>
    <span class="text-sm text-muted-foreground">{{ t('candidates.total', { count: c.total.value }) }}</span>
    <UiButton v-if="canManage" class="ml-auto" @click="c.openCreate">
      <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiInput, UiSelect, UiIcon } from '@/shared/components'
import { Plus, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { CandidateStatus, CANDIDATE_STATUS_LABEL_KEYS } from '../enums/candidate-status.enum'
import { CandidatePosition, CANDIDATE_POSITION_LABEL_KEYS } from '../enums/candidate-position.enum'
import type { useCandidates } from '../composables/use-candidates'

const { t } = useI18n()
const props = defineProps<{ c: ReturnType<typeof useCandidates>; canManage?: boolean }>()

const onSearch = debounce((ev: Event) => props.c.search((ev.target as HTMLInputElement).value))
const statuses = computed(() =>
  Object.values(CandidateStatus).map((s) => ({ label: t(CANDIDATE_STATUS_LABEL_KEYS[s]), value: s })),
)
const positions = computed(() =>
  Object.values(CandidatePosition).map((p) => ({ label: t(CANDIDATE_POSITION_LABEL_KEYS[p]), value: p })),
)
</script>
