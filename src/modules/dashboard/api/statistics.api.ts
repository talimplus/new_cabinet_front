import { http } from '@/shared/api/http'
import type { StatsOverviewResponse, StatsRangeParams } from '../interfaces/stats-overview.interface'
import type { StatsTrendParams, StatsTrendResponse } from '../interfaces/stats-trend.interface'
import type { StatsDetailsParams, StatsDetailsResponse } from '../interfaces/stats-details.interface'
import type { StatsDetailKind } from '../enums/stats-detail-kind.enum'

/** GET /statistics/overview — cash in/out by day + monthly fees + students. */
export async function fetchStatsOverview(params: StatsRangeParams): Promise<StatsOverviewResponse> {
  const { data } = await http.get<StatsOverviewResponse>('/statistics/overview', { params })
  return data
}

/** GET /statistics/trend — the last N months; independent of the page's period. */
export async function fetchStatsTrend(params: StatsTrendParams): Promise<StatsTrendResponse> {
  const { data } = await http.get<StatsTrendResponse>('/statistics/trend', { params })
  return data
}

/** GET /statistics/details/:kind — the rows behind one statistics block. */
export async function fetchStatsDetails<T>(
  kind: StatsDetailKind,
  params: StatsDetailsParams,
): Promise<StatsDetailsResponse<T>> {
  const { data } = await http.get<StatsDetailsResponse<T>>(`/statistics/details/${kind}`, { params })
  return data
}
