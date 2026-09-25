import { describe, it, expect } from 'vitest'
import { messages } from '@/locales/messages'
import { AppLocale } from '@/shared/enums/app-locale.enum'

function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  )
}

describe('locale parity', () => {
  it('uz and ru expose the same keys', () => {
    const uz = new Set(flatten(messages[AppLocale.UZ]))
    const ru = new Set(flatten(messages[AppLocale.RU]))
    const missingInRu = [...uz].filter((k) => !ru.has(k))
    const missingInUz = [...ru].filter((k) => !uz.has(k))
    expect({ missingInRu, missingInUz }).toEqual({ missingInRu: [], missingInUz: [] })
  })
})
