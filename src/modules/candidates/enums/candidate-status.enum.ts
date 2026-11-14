/** Hiring decision on a candidate — values match the backend exactly. */
export enum CandidateStatus {
  /** No decision yet. */
  NEW = 'new',
  HIRED = 'hired',
  /** 50/50 — still thinking. */
  MAYBE = 'maybe',
  REJECTED = 'rejected',
}

export const CANDIDATE_STATUS_LABEL_KEYS: Record<CandidateStatus, string> = {
  [CandidateStatus.NEW]: 'candidates.statuses.new',
  [CandidateStatus.HIRED]: 'candidates.statuses.hired',
  [CandidateStatus.MAYBE]: 'candidates.statuses.maybe',
  [CandidateStatus.REJECTED]: 'candidates.statuses.rejected',
}

export const CANDIDATE_STATUS_VARIANTS: Record<CandidateStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  [CandidateStatus.NEW]: 'neutral',
  [CandidateStatus.HIRED]: 'success',
  [CandidateStatus.MAYBE]: 'warning',
  [CandidateStatus.REJECTED]: 'danger',
}
