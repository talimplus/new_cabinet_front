<template>
  <!--
    The `md:hidden` half of `UiTable`: one card per row (ui-and-forms.md §4.2).
    A wide table would push the whole page sideways, so the same `cell-*` slots
    are re-used in a stacked layout — the first (or `primary`) column becomes
    the heading. Never used directly; `UiTable` forwards its slots here.
  -->
  <div class="space-y-2 md:hidden">
    <div
      v-if="loading && !rows.length"
      class="rounded-lg border border-border bg-surface p-8 text-center"
    >
      <UiSpinner :size="22" class="mx-auto text-muted-foreground" />
    </div>
    <p
      v-else-if="!rows.length"
      class="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground"
    >
      {{ emptyLabel }}
    </p>

    <article
      v-for="(row, i) in rows"
      v-else
      :key="String(row[rowKey] ?? i)"
      :class="cn('rounded-lg border border-border bg-surface p-3 shadow-card', rowClass?.(row))"
    >
      <div v-if="headColumn" class="min-w-0 font-medium text-foreground">
        <slot :name="`cell-${headColumn.key}`" :row="row as unknown" :value="row[headColumn.key]">
          {{ row[headColumn.key] }}
        </slot>
      </div>

      <dl v-if="bodyColumns.length" class="mt-2 space-y-1.5 border-t border-border pt-2">
        <div
          v-for="col in bodyColumns"
          :key="col.key"
          class="flex items-start justify-between gap-3 text-sm"
        >
          <dt class="shrink-0 text-muted-foreground">{{ col.label }}</dt>
          <dd class="min-w-0 text-right text-foreground">
            <slot :name="`cell-${col.key}`" :row="row as unknown" :value="row[col.key]">{{
              row[col.key]
            }}</slot>
          </dd>
        </div>
      </dl>

      <!-- Actions get their own row so a wide button never squeezes the title. -->
      <div
        v-if="$slots.actions"
        class="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3"
      >
        <slot name="actions" :row="row as unknown" />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/utils/cn'
import UiSpinner from './UiSpinner.vue'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

interface Props {
  columns: TableColumn[]
  rows: Array<Record<string, unknown>>
  rowKey: string
  /** Already translated by `UiTable`. */
  emptyLabel: string
  loading?: boolean
  rowClass?: (row: Record<string, unknown>) => string | undefined
}

const props = defineProps<Props>()

const mobileColumns = computed(() => props.columns.filter((c) => !c.hideOnMobile))
const headColumn = computed(
  () => mobileColumns.value.find((c) => c.primary) ?? mobileColumns.value[0],
)
const bodyColumns = computed(() => mobileColumns.value.filter((c) => c !== headColumn.value))
</script>
