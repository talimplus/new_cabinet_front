/** The inner tabs of the group detail page. */
export enum GroupTab {
  ATTENDANCE = 'attendance',
  PLAN = 'plan',
  STUDENTS = 'students',
  INFO = 'info',
}

export const GROUP_TAB_LABEL_KEYS: Record<GroupTab, string> = {
  [GroupTab.ATTENDANCE]: 'groups.tabs.attendance',
  [GroupTab.PLAN]: 'groups.tabs.plan',
  [GroupTab.STUDENTS]: 'groups.tabs.students',
  [GroupTab.INFO]: 'groups.tabs.info',
}
