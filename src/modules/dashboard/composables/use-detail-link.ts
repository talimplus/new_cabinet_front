import type { RouteLocationRaw } from 'vue-router'
import type { StatsDetailKind } from '../enums/stats-detail-kind.enum'

/** Link to an inner statistics page that keeps the current period (+ an inner filter). */
export function detailLink(
  kind: StatsDetailKind,
  period: Record<string, string>,
  extra: Record<string, string> = {},
): RouteLocationRaw {
  return { name: 'statistics-detail', params: { kind }, query: { ...period, ...extra } }
}
