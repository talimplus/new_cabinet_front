export enum TopicDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export const TOPIC_DIFFICULTY_LABEL_KEYS: Record<TopicDifficulty, string> = {
  [TopicDifficulty.EASY]: 'syllabuses.difficulty.easy',
  [TopicDifficulty.MEDIUM]: 'syllabuses.difficulty.medium',
  [TopicDifficulty.HARD]: 'syllabuses.difficulty.hard',
}

export const TOPIC_DIFFICULTY_VARIANTS: Record<TopicDifficulty, 'success' | 'warning' | 'danger'> = {
  [TopicDifficulty.EASY]: 'success',
  [TopicDifficulty.MEDIUM]: 'warning',
  [TopicDifficulty.HARD]: 'danger',
}
