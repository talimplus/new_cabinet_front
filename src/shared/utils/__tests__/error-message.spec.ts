import { describe, it, expect, afterEach } from 'vitest'
import type { AxiosError } from 'axios'
import { resolveErrorMessage } from '../error-message'
import { t, setLocale } from '@/locales'
import { AppLocale } from '@/shared/enums/app-locale.enum'

function makeError(response?: { status: number; data: unknown }): AxiosError {
  return { response } as unknown as AxiosError
}

describe('resolveErrorMessage', () => {
  afterEach(() => {
    setLocale(AppLocale.UZ)
  })

  it('falls back to the network message when there is no response', () => {
    expect(resolveErrorMessage(makeError())).toBe(t('common.errors.network'))
  })

  it('returns a string response body as-is', () => {
    expect(resolveErrorMessage(makeError({ status: 400, data: 'plain text error' }))).toBe(
      'plain text error',
    )
  })

  it('returns body.message when it is a string', () => {
    expect(resolveErrorMessage(makeError({ status: 400, data: { message: 'x' } }))).toBe('x')
  })

  it('joins body.message when it is an array', () => {
    expect(
      resolveErrorMessage(makeError({ status: 400, data: { message: ['a', 'b'] } })),
    ).toBe('a, b')
  })

  it('returns body.error when present', () => {
    expect(resolveErrorMessage(makeError({ status: 400, data: { error: 'e' } }))).toBe('e')
  })

  it('returns the first field error message when body.errors values are arrays', () => {
    expect(
      resolveErrorMessage(makeError({ status: 422, data: { errors: { f: ['m1'] } } })),
    ).toBe('m1')
  })

  it('returns the first field error message when body.errors values are strings', () => {
    expect(
      resolveErrorMessage(makeError({ status: 422, data: { errors: { f: 'm2' } } })),
    ).toBe('m2')
  })

  it('falls back to the server message on an empty body with a 5xx status', () => {
    expect(resolveErrorMessage(makeError({ status: 500, data: {} }))).toBe(
      t('common.errors.server'),
    )
  })

  it('falls back to the forbidden message on 403', () => {
    expect(resolveErrorMessage(makeError({ status: 403, data: {} }))).toBe(
      t('common.errors.forbidden'),
    )
  })

  it('falls back to the unknown message on an empty body with another status', () => {
    expect(resolveErrorMessage(makeError({ status: 404, data: {} }))).toBe(
      t('common.errors.unknown'),
    )
  })

  it('resolves fallback messages according to the active locale', () => {
    const uzMessage = resolveErrorMessage(makeError())

    setLocale(AppLocale.RU)
    const ruMessage = resolveErrorMessage(makeError())

    expect(ruMessage).toBe(t('common.errors.network'))
    expect(ruMessage).not.toBe(uzMessage)
  })
})
