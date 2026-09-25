/** The three markdown content fields a topic carries (backend field names). */
export enum TopicContentKey {
  GUIDE = 'guide',
  LESSON_OUTLINE = 'lessonOutline',
  HOMEWORK = 'homework',
}

export const TOPIC_CONTENT_KEYS: TopicContentKey[] = [
  TopicContentKey.GUIDE,
  TopicContentKey.LESSON_OUTLINE,
  TopicContentKey.HOMEWORK,
]

export const TOPIC_CONTENT_LABEL_KEYS: Record<TopicContentKey, string> = {
  [TopicContentKey.GUIDE]: 'syllabuses.content.guide',
  [TopicContentKey.LESSON_OUTLINE]: 'syllabuses.content.lessonOutline',
  [TopicContentKey.HOMEWORK]: 'syllabuses.content.homework',
}
