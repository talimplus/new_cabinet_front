export enum GroupStatus {
  NEW = 'new',
  STARTED = 'started',
  FINISHED = 'finished',
}

export const GROUP_STATUS_LABEL_KEYS: Record<GroupStatus, string> = {
  [GroupStatus.NEW]: 'groups.status.new',
  [GroupStatus.STARTED]: 'groups.status.started',
  [GroupStatus.FINISHED]: 'groups.status.finished',
}

/** Allowed transitions (old cabinet_front): new→started, started→new/finished, finished→none. */
export const GROUP_STATUS_TRANSITIONS: Record<GroupStatus, GroupStatus[]> = {
  [GroupStatus.NEW]: [GroupStatus.STARTED],
  [GroupStatus.STARTED]: [GroupStatus.NEW, GroupStatus.FINISHED],
  [GroupStatus.FINISHED]: [],
}
