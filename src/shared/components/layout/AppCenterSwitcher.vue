<template>
  <!-- Owner side: one picker that scopes the whole app. -->
  <UiSelect
    v-if="scope.canSwitch && scope.centers.length > 1"
    :model-value="selected"
    :options="options"
    :searchable="false"
    :clearable="false"
    class="w-36 sm:w-56"
    @update:model-value="onChange"
  />

  <!-- Everyone else is pinned to their own center — show it, don't offer a choice. -->
  <span
    v-else-if="scope.ownCenter"
    class="hidden max-w-[10rem] items-center gap-1.5 truncate rounded-md bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex"
  >
    <UiIcon :icon="Building2" :size="14" />
    <span class="truncate">{{ scope.ownCenter.name }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiSelect from '@/shared/components/UiSelect.vue'
import UiIcon from '@/shared/components/UiIcon.vue'
import { Building2 } from '@/shared/icons'
import { useScopeStore } from '@/stores/scope.store'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/** Sentinel for "All centers" — the multiselect cannot carry `null` as a value. */
const ALL = 'all'

const { t } = useI18n()
const scope = useScopeStore()

const selected = computed<string | number>(() => scope.activeCenterId ?? ALL)

const options = computed<SelectOption[]>(() => [
  { label: t('layout.allCenters'), value: ALL },
  ...scope.centers.map((c) => ({ label: c.name, value: c.id })),
])

function onChange(value: string | number | Array<string | number> | null): void {
  scope.setActive(typeof value === 'number' ? value : null)
}
</script>
