/** The tables on the staff overview card. */
export enum StaffTab {
  LATE = 'late',
  RECEIPTS = 'receipts',
  DEDUCTIONS = 'deductions',
  ADVANCES = 'advances',
  BONUSES = 'bonuses',
  MONTHS = 'months',
}

export const STAFF_TAB_LABEL_KEYS: Record<StaffTab, string> = {
  [StaffTab.LATE]: 'staff.tabs.late',
  [StaffTab.RECEIPTS]: 'staff.tabs.receipts',
  [StaffTab.DEDUCTIONS]: 'staff.tabs.deductions',
  [StaffTab.ADVANCES]: 'staff.tabs.advances',
  [StaffTab.BONUSES]: 'staff.tabs.bonuses',
  [StaffTab.MONTHS]: 'staff.tabs.months',
}
