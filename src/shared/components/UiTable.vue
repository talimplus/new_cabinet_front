<template>
  <!-- Desktop: a real table. -->
  <div
    class="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-card md:block"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-surface-muted">
          <tr>
            <th v-for="col in columns" :key="col.key" :class="headClass(col)">
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" class="w-0 px-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !rows.length">
            <td :colspan="colspan" class="p-8 text-center">
              <UiSpinner :size="22" class="mx-auto text-muted-foreground" />
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td :colspan="colspan" class="p-8 text-center text-sm text-muted-foreground">
              {{ emptyLabel }}
            </td>
          </tr>
          <tr
            v-for="(row, i) in rows"
            :key="String(row[rowKey] ?? i)"
            :class="
              cn('border-t border-border transition-colors hover:bg-surface-muted', rowClass?.(row))
            "
          >
            <td v-for="col in columns" :key="col.key" :class="cellClass(col)">
              <slot :name="`cell-${col.key}`" :row="row as unknown" :value="row[col.key]">{{
                row[col.key]
              }}</slot>
            </td>
            <td v-if="$slots.actions" class="px-3 py-2.5 text-right">
              <slot name="actions" :row="row as unknown" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Below `md` the same rows render as cards; every slot is forwarded. -->
  <UiTableCards
    :columns="columns"
    :rows="rows"
    :row-key="rowKey"
    :empty-label="emptyLabel"
    :loading="loading"
    :row-class="rowClass"
  >
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope ?? {}" />
    </template>
  </UiTableCards>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import UiSpinner from './UiSpinner.vue'
import UiTableCards from './UiTableCards.vue'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

interface Props {
  columns: TableColumn[]
  rows: Array<Record<string, unknown>>
  rowKey?: string
  loading?: boolean
  /** Overrides the default "no data" line; already-translated text. */
  emptyText?: string
  /** Extra classes per row — applied to both the `<tr>` and the mobile card. */
  rowClass?: (row: Record<string, unknown>) => string | undefined
}

const props = withDefaults(defineProps<Props>(), { rowKey: 'id' })

const { t } = useI18n()
const emptyLabel = computed(() => props.emptyText ?? t('common.noData'))
const colspan = computed(() => props.columns.length + 1)

const alignEnd = (col: TableColumn) => col.align === 'right' && 'text-right'
const headClass = (col: TableColumn) =>
  cn(
    'whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
    alignEnd(col),
  )
const cellClass = (col: TableColumn) =>
  cn('px-3 py-2.5 align-middle text-foreground', alignEnd(col))
</script>
