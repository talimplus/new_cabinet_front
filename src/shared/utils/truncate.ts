/**
 * Shorten a string to `max` characters, appending an ellipsis when it was cut.
 * Empty/nullish input yields an empty string. Used by table cells that show a
 * long free-text field inline with the full value in a `title` tooltip.
 */
export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return ''
  return text.length <= max ? text : `${text.slice(0, max)}…`
}
