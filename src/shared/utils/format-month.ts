/** Backend `forMonth` ("YYYY-MM" or "YYYY-MM-DD") → "MM.YYYY", or "—". */
export function formatMonth(value?: string | null): string {
  if (!value) return '—'
  const [year, month] = value.split('-')
  if (!year || !month) return '—'
  return `${month}.${year}`
}
