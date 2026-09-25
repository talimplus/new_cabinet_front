import { describe, it, expect } from 'vitest'
import { findApiRule, normalizePath } from '../match-api-rule'
import { API_PERMISSIONS, HttpMethod } from '../api-permissions'
import { Permission } from '@/shared/enums/permission.enum'

describe('normalizePath', () => {
  it('strips the baseURL', () => {
    expect(normalizePath('/students', 'http://localhost:3004')).toBe('/students')
  })

  it('strips an absolute origin', () => {
    expect(normalizePath('http://localhost:3004/groups/5')).toBe('/groups/5')
  })

  it('drops the query string', () => {
    expect(normalizePath('/payments?centerId=4&page=1')).toBe('/payments')
  })

  it('adds the leading slash', () => {
    expect(normalizePath('rooms')).toBe('/rooms')
  })
})

describe('findApiRule', () => {
  it('matches a static path', () => {
    expect(findApiRule('get', '/payments')?.permissions).toEqual([Permission.PAYMENTS_VIEW])
  })

  it('matches a parametrised path', () => {
    expect(findApiRule('put', '/expenses/12')?.permissions).toEqual([Permission.EXPENSES_UPDATE])
  })

  it('prefers a static segment over a parameter', () => {
    // `/groups/all` must not be swallowed by `/groups/:id`
    expect(findApiRule('get', '/groups/all')?.path).toBe('/groups/all')
    expect(findApiRule('get', '/groups/7')?.path).toBe('/groups/:id')
  })

  it('keeps open endpoints open so they are never blocked', () => {
    expect(findApiRule('get', '/centers/all')?.permissions).toEqual([])
    expect(findApiRule('get', '/centers/9')?.permissions).toEqual([Permission.CENTERS_VIEW])
  })

  it('distinguishes methods on the same path', () => {
    expect(findApiRule('get', '/rooms')?.permissions).toEqual([Permission.ROOMS_VIEW])
    expect(findApiRule('post', '/rooms')?.permissions).toEqual([Permission.ROOMS_MANAGE])
  })

  it('matches deep nested templates', () => {
    const rule = findApiRule('put', '/groups/3/plan/lessons/5/topics')
    expect(rule?.permissions).toEqual([Permission.GROUP_PLAN_MANAGE])
  })

  it('returns undefined for an unlisted path (treated as open)', () => {
    expect(findApiRule('get', '/not/a/real/endpoint')).toBeUndefined()
  })

  it('is case-insensitive on the method', () => {
    expect(findApiRule('GET', '/leads')).toBe(findApiRule('get', '/leads'))
  })
})

describe('API_PERMISSIONS table', () => {
  it('uses only known HTTP methods', () => {
    const known = Object.values(HttpMethod)
    expect(API_PERMISSIONS.every((r) => known.includes(r.method))).toBe(true)
  })

  it('has no duplicate method+path rules', () => {
    const seen = API_PERMISSIONS.map((r) => `${r.method} ${r.path}`)
    expect(new Set(seen).size).toBe(seen.length)
  })

  it('starts every path with a slash', () => {
    expect(API_PERMISSIONS.every((r) => r.path.startsWith('/'))).toBe(true)
  })
})
