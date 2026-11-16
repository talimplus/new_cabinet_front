import type { SummaryTone } from '../enums/health-level.enum'

/** One plain-words sentence of the statistics digest. */
export interface SummaryLine {
  key: string
  text: string
  tone: SummaryTone
}
