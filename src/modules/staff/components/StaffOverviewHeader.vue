<template>
  <div class="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4">
    <span
      class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-lg font-bold text-on-primary-soft"
    >
      {{ initials }}
    </span>

    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-semibold text-foreground">
        {{ user.firstName }} {{ user.lastName }}
      </p>
      <p class="truncate text-sm text-muted-foreground">{{ subtitle }}</p>
      <p v-if="user.dismissedAt" class="mt-1 inline-flex rounded-sm bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
        {{ t('staff.dismissed', { date: formatDate(user.dismissedAt) }) }}<template v-if="user.dismissalReason"> — {{ user.dismissalReason }}</template>
      </p>
    </div>

    <!-- Page-level actions (advance / bonus) — admin view only, never for a dismissed employee. -->
    <slot />

    <div class="w-full sm:w-52">
      <UiSelect
        :model-value="month"
        :options="monthOptions"
        :label="t('staff.month')"
        :searchable="false"
        :clearable="false"
        @update:model-value="onMonth"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSelect } from '@/shared/components'
import { buildStaffMonthOptions } from '../config/staff-months'
import { formatDate } from '@/shared/utils/format-date'
import type { StaffOverviewUser } from '../interfaces/staff-overview.interface'

const { t } = useI18n()

const props = defineProps<{ user: StaffOverviewUser; month: string }>()
const emit = defineEmits<{ 'update:month': [value: string] }>()

// A dismissed employee has no months after the last working day.
const monthOptions = computed(() =>
  buildStaffMonthOptions(props.user.dismissedAt ? new Date(`${props.user.dismissedAt}T00:00:00`) : undefined),
)

const initials = computed(() =>
  `${props.user.firstName?.[0] ?? ''}${props.user.lastName?.[0] ?? ''}`.toUpperCase(),
)

/** Role name (admin-defined) · center · phone — whichever are present. */
const subtitle = computed(() =>
  [props.user.roleName || props.user.role, props.user.centerName, props.user.phone]
    .filter(Boolean)
    .join(' · '),
)

const onMonth = (value: unknown) => {
  if (typeof value === 'string') emit('update:month', value)
}
</script>
