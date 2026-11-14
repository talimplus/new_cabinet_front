import { UserRole } from '@/shared/enums/user-role.enum'

/** The job a candidate applies for — values match the backend exactly. */
export enum CandidatePosition {
  TEACHER = 'teacher',
  /** Assistant teacher — has a subject, like a teacher. */
  ASSISTANT = 'assistant',
  /** Front-desk administrator (reception). */
  ADMIN = 'admin',
  MANAGER = 'manager',
  /** Sales / call-center operator. */
  SALES = 'sales',
  /** Marketer / SMM. */
  MARKETING = 'marketing',
  /** Accountant / cashier. */
  ACCOUNTANT = 'accountant',
  OTHER = 'other',
}

export const CANDIDATE_POSITION_LABEL_KEYS: Record<CandidatePosition, string> = {
  [CandidatePosition.TEACHER]: 'candidates.positions.teacher',
  [CandidatePosition.ASSISTANT]: 'candidates.positions.assistant',
  [CandidatePosition.ADMIN]: 'candidates.positions.admin',
  [CandidatePosition.MANAGER]: 'candidates.positions.manager',
  [CandidatePosition.SALES]: 'candidates.positions.sales',
  [CandidatePosition.MARKETING]: 'candidates.positions.marketing',
  [CandidatePosition.ACCOUNTANT]: 'candidates.positions.accountant',
  [CandidatePosition.OTHER]: 'candidates.positions.other',
}

/** Only these positions have a subject (required for a teacher). */
export const POSITIONS_WITH_SUBJECT: CandidatePosition[] = [
  CandidatePosition.TEACHER,
  CandidatePosition.ASSISTANT,
]

/** Which role type to pre-pick in the hire form (the admin can change it). */
export const CANDIDATE_POSITION_BASE_ROLE: Record<CandidatePosition, UserRole> = {
  [CandidatePosition.TEACHER]: UserRole.TEACHER,
  [CandidatePosition.ASSISTANT]: UserRole.OTHER,
  [CandidatePosition.ADMIN]: UserRole.RECEPTION,
  [CandidatePosition.MANAGER]: UserRole.MANAGER,
  [CandidatePosition.SALES]: UserRole.RECEPTION,
  [CandidatePosition.MARKETING]: UserRole.OTHER,
  [CandidatePosition.ACCOUNTANT]: UserRole.OTHER,
  [CandidatePosition.OTHER]: UserRole.OTHER,
}
