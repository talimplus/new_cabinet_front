import { describe, it, expect } from 'vitest'
import { placePanel } from '../use-floating-panel'

const rect = (r: Partial<DOMRect>) =>
  ({ left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}), ...r }) as DOMRect
const viewport = { width: 400, height: 800 }
const panel = { width: 180, height: 120 }

describe('placePanel', () => {
  it('drops the panel under a left-aligned anchor', () => {
    const anchor = rect({ left: 50, right: 150, top: 100, bottom: 130 })
    expect(placePanel(anchor, panel, 'left', viewport)).toEqual({ top: 134, left: 50 })
  })

  it('lines the right edges up for align="right"', () => {
    const anchor = rect({ left: 200, right: 300, top: 100, bottom: 130 })
    expect(placePanel(anchor, panel, 'right', viewport).left).toBe(120)
  })

  it('flips above the anchor on the last rows of a page', () => {
    const anchor = rect({ left: 50, right: 150, top: 740, bottom: 770 })
    expect(placePanel(anchor, panel, 'left', viewport).top).toBe(740 - 4 - 120)
  })

  it('stays below when there is no room above either', () => {
    const anchor = rect({ left: 50, right: 150, top: 60, bottom: 90 })
    expect(placePanel(anchor, panel, 'left', { width: 400, height: 150 }).top).toBe(94)
  })

  it('pulls a panel back inside the right and left edges', () => {
    const nearRight = rect({ left: 330, right: 390, top: 100, bottom: 130 })
    expect(placePanel(nearRight, panel, 'left', viewport).left).toBe(400 - 180 - 8)
    const nearLeft = rect({ left: 0, right: 60, top: 100, bottom: 130 })
    expect(placePanel(nearLeft, panel, 'right', viewport).left).toBe(8)
  })
})
