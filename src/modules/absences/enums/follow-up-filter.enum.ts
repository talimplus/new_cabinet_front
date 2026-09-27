/** UI filter over `followedUp` — `ALL` is a sentinel and is not sent. */
export enum FollowUpFilter {
  ALL = 'all',
  PENDING = 'pending',
  DONE = 'done',
}

export const FOLLOW_UP_FILTER_LABEL_KEYS: Record<FollowUpFilter, string> = {
  [FollowUpFilter.ALL]: 'absences.filter.followUpAll',
  [FollowUpFilter.PENDING]: 'absences.filter.followUpPending',
  [FollowUpFilter.DONE]: 'absences.filter.followUpDone',
}
