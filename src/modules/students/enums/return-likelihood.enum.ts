export enum ReturnLikelihood {
  NEVER = 'never',
  MAYBE = 'maybe',
  SURE = 'sure',
}

export const RETURN_LIKELIHOOD_LABEL_KEYS: Record<ReturnLikelihood, string> = {
  [ReturnLikelihood.NEVER]: 'students.likelihood.never',
  [ReturnLikelihood.MAYBE]: 'students.likelihood.maybe',
  [ReturnLikelihood.SURE]: 'students.likelihood.sure',
}
