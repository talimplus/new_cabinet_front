import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from '../use-theme'
import { ThemeMode } from '@/shared/enums/theme-mode.enum'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('useTheme', () => {
  it('setMode persists to localStorage under "theme"', () => {
    const { setMode } = useTheme()
    setMode(ThemeMode.DARK)
    expect(localStorage.getItem('theme')).toBe(ThemeMode.DARK)

    setMode(ThemeMode.LIGHT)
    expect(localStorage.getItem('theme')).toBe(ThemeMode.LIGHT)
  })

  it('setMode(DARK) adds .dark to <html> and reflects isDark', () => {
    const { setMode, isDark } = useTheme()
    setMode(ThemeMode.DARK)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(isDark.value).toBe(true)
  })

  it('setMode(LIGHT) removes .dark and clears isDark', () => {
    const { setMode, isDark } = useTheme()
    setMode(ThemeMode.DARK)
    setMode(ThemeMode.LIGHT)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(isDark.value).toBe(false)
  })

  it('toggle flips between light and dark', () => {
    const { setMode, toggle, isDark } = useTheme()
    setMode(ThemeMode.LIGHT)
    expect(isDark.value).toBe(false)

    toggle()
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    toggle()
    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
