import { cn } from '@/shared/utils/cn'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

/** Class builders for `UiTable` — kept out of the component (100-line limit). */
const alignEnd = (col: TableColumn) => col.align === 'right' && 'text-right'

export const tableHeadClass = (col: TableColumn): string =>
  cn(
    'whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
    alignEnd(col),
  )

export const tableRowClass = (clickable: boolean, extra?: string): string =>
  cn('border-t border-border transition-colors hover:bg-surface-muted', clickable && 'cursor-pointer', extra)

export const tableCellClass = (col: TableColumn): string =>
  cn('px-3 py-2.5 align-middle text-foreground', alignEnd(col),
    col.rowNumber && 'w-0 font-mono text-xs text-muted-foreground')
