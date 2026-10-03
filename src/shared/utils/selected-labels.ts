const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * The text a multiple select shows for its current picks: the option labels,
 * comma-joined in the options' own order (not click order, so "Mon, Wed" never
 * reads "Wed, Mon"). The package renders it with `v-html`, so every label is
 * escaped — an option name typed by a user must never become markup.
 */
export function selectedLabels(
  picked: unknown,
  options: object[],
  labelProp: string,
  valueProp: string,
): string {
  if (!Array.isArray(picked)) return ''
  const values = new Set(picked.map((p) => (p as Record<string, unknown>)?.[valueProp]))
  return (options as Record<string, unknown>[])
    .filter((option) => values.has(option[valueProp]))
    .map((option) => String(option[labelProp] ?? ''))
    .filter(Boolean)
    .map((label) => label.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch))
    .join(', ')
}
