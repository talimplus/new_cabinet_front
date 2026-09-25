/** Display a backend date string (ISO or "YYYY-MM-DD") as dd.MM.yyyy, or "—". */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Same, plus hh:mm — for receipts and audit trails. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

/** A Date → "YYYY-MM-DD" using local parts (no timezone shift). */
export function toDateString(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** A "YYYY-MM-DD" (or ISO) string → Date at local midnight, or null. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(d.getTime()) ? null : d
}
