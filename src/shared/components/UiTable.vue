<template>
  <div class="relative" :aria-busy="loading || undefined">
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
              v-for="(row, i) in rows" :key="String(row[rowKey] ?? i)" :class="trClass(row)"
              :tabindex="rowClick ? 0 : undefined" @click="click.onClick(row, $event)" @keydown="click.onKeydown(row, $event)"
            >
              <td v-for="col in columns" :key="col.key" :class="cellClass(col)" :data-no-row-click="col.noRowClick || undefined">
                <slot :name="`cell-${col.key}`" :row="row as unknown" :value="row[col.key]">{{
                  col.rowNumber ? rowOffset + i + 1 : row[col.key]
                }}</slot>
              </td>
              <td v-if="$slots.actions" class="px-3 py-2.5 text-right" data-no-row-click>
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
      :row-click="rowClick"
    >
      <template v-for="(_, name) in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope ?? {}" />
      </template>
    </UiTableCards>
    <UiTableRefresh :active="Boolean(loading && rows.length)" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { tableHeadClass, tableRowClass, tableCellClass } from '@/shared/utils/table-classes'
import UiSpinner from './UiSpinner.vue'
import UiTableCards from './UiTableCards.vue'
import UiTableRefresh from './UiTableRefresh.vue'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useRowClick } from '@/shared/composables/use-row-click'

interface Props {
  columns: TableColumn[]
  rows: Array<Record<string, unknown>>
  rowKey?: string
  loading?: boolean
  /** Overrides the default "no data" line; already-translated text. */
  emptyText?: string
  /** Extra classes per row — applied to both the `<tr>` and the mobile card. */
  rowClass?: (row: Record<string, unknown>) => string | undefined
  /** Rows before this page (`(page - 1) * perPage`) — continues the № column. */
  rowOffset?: number
  /** Opens the row (its inner page); actions and interactive cells never trigger it. */
  rowClick?: (row: Record<string, unknown>) => void
}

const props = withDefaults(defineProps<Props>(), { rowKey: 'id', rowOffset: 0 })

const { t } = useI18n()
const emptyLabel = computed(() => props.emptyText ?? t('common.noData'))
const colspan = computed(() => props.columns.length + 1)

const click = useRowClick(() => props.rowClick)
const headClass = tableHeadClass
const cellClass = tableCellClass
const trClass = (row: Record<string, unknown>) => tableRowClass(!!props.rowClick, props.rowClass?.(row))
</script>
