import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadBlob } from '../download-file'

describe('downloadBlob', () => {
  const objectUrl = 'blob:mock-url'

  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn<(blob: Blob) => string>(() => objectUrl),
      revokeObjectURL: vi.fn<(url: string) => void>(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('clicks a temporary anchor with the right download name, then removes and revokes it', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    const blob = new Blob(['excel-bytes'])
    downloadBlob(blob, 'tolovlar_2026-09-24.xlsx')

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)

    const anchor = appendSpy.mock.calls[0]![0] as HTMLAnchorElement
    expect(anchor.tagName).toBe('A')
    expect(anchor.download).toBe('tolovlar_2026-09-24.xlsx')
    expect(anchor.href).toContain(objectUrl)

    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(document.body.contains(anchor)).toBe(false)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)

    clickSpy.mockRestore()
    appendSpy.mockRestore()
  })
})
