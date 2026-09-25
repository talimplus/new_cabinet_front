export enum TopicDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/** Difficulty → UiBadge variant map (easy=success, medium=warning, hard=danger). */
export const TOPIC_DIFFICULTY_BADGE: Record<TopicDifficulty, 'success' | 'warning' | 'danger'> = {
  [TopicDifficulty.EASY]: 'success',
  [TopicDifficulty.MEDIUM]: 'warning',
  [TopicDifficulty.HARD]: 'danger',
}

export const TOPIC_DIFFICULTY_LABEL_KEYS: Record<TopicDifficulty, string> = {
  [TopicDifficulty.EASY]: 'syllabuses.difficulty.easy',
  [TopicDifficulty.MEDIUM]: 'syllabuses.difficulty.medium',
  [TopicDifficulty.HARD]: 'syllabuses.difficulty.hard',
}
