import { GroupStatus } from './group-status.enum'

/** Which groups the list shows. UI-only; mapped onto `?status=` (comma list). */
export enum GroupListScope {
  /** NEW + STARTED — the everyday list. */
  ACTIVE = 'active',
  /** Closed / lessons over — kept with their attendance and students. */
  FINISHED = 'finished',
  ALL = 'all',
}

export const GROUP_LIST_SCOPE_LABEL_KEYS: Record<GroupListScope, string> = {
  [GroupListScope.ACTIVE]: 'groups.filter.scopeActive',
  [GroupListScope.FINISHED]: 'groups.filter.scopeFinished',
  [GroupListScope.ALL]: 'groups.filter.scopeAll',
}

/** `status` query value per scope; `undefined` — every status. */
export const GROUP_LIST_SCOPE_STATUSES: Record<GroupListScope, string | undefined> = {
  [GroupListScope.ACTIVE]: [GroupStatus.NEW, GroupStatus.STARTED].join(','),
  [GroupListScope.FINISHED]: GroupStatus.FINISHED,
  [GroupListScope.ALL]: undefined,
}
