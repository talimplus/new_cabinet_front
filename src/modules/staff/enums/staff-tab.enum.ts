/** The four tables on the staff overview card. */
export enum StaffTab {
  LATE = 'late',
  RECEIPTS = 'receipts',
  DEDUCTIONS = 'deductions',
  MONTHS = 'months',
}

export const STAFF_TAB_LABEL_KEYS: Record<StaffTab, string> = {
  [StaffTab.LATE]: 'staff.tabs.late',
  [StaffTab.RECEIPTS]: 'staff.tabs.receipts',
  [StaffTab.DEDUCTIONS]: 'staff.tabs.deductions',
  [StaffTab.MONTHS]: 'staff.tabs.months',
}
