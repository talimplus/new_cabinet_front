export enum LeadStatus {
  NEW = 'new',
  DISCARDED = 'discarded',
  CONVERTED = 'converted',
  LATER = 'keyinroq', // ⚠️ backend value is Uzbek "keyinroq" (later) — keep exact
}

/** i18n key per status — resolved with `t()` at render time. */
export const LEAD_STATUS_LABEL_KEYS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'leads.status.new',
  [LeadStatus.DISCARDED]: 'leads.status.discarded',
  [LeadStatus.CONVERTED]: 'leads.status.converted',
  [LeadStatus.LATER]: 'leads.status.later',
}

export const LEAD_STATUS_VARIANTS: Record<
  LeadStatus,
  'info' | 'danger' | 'success' | 'warning'
> = {
  [LeadStatus.NEW]: 'info',
  [LeadStatus.DISCARDED]: 'danger',
  [LeadStatus.CONVERTED]: 'success',
  [LeadStatus.LATER]: 'warning',
}

/**
 * Allowed status transitions (mirrors old cabinet_front): from NEW the only
 * option is DISCARDED (opens a reason dialog). Other statuses are terminal in
 * the table.
 */
export const LEAD_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.NEW]: [LeadStatus.DISCARDED],
  [LeadStatus.DISCARDED]: [],
  [LeadStatus.CONVERTED]: [],
  [LeadStatus.LATER]: [],
}
