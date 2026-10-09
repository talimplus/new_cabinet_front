import { ref, onUnmounted, type Ref } from 'vue'

const GAP = 4
const MARGIN = 8

export interface PanelSize {
  width: number
  height: number
}
export interface PanelPosition {
  top: number
  left: number
}

/**
 * Where a popover of `panel` size goes next to `anchor`, in viewport (fixed)
 * coordinates: under the anchor, or above it when the bottom has no room
 * (the last row of a table); never past the left/right edge.
 */
export function placePanel(
  anchor: DOMRect,
  panel: PanelSize,
  align: 'left' | 'right',
  viewport: PanelSize,
): PanelPosition {
  const wanted = align === 'right' ? anchor.right - panel.width : anchor.left
  const left = Math.max(MARGIN, Math.min(wanted, viewport.width - panel.width - MARGIN))
  const below = anchor.bottom + GAP
  const above = anchor.top - GAP - panel.height
  const fitsBelow = below + panel.height <= viewport.height - MARGIN
  return { top: !fitsBelow && above >= MARGIN ? above : below, left }
}

/**
 * Keeps a body-teleported panel glued to its anchor. A panel rendered inside
 * the table was clipped by the table's `overflow` box — on the last rows the
 * status options were simply invisible. Rendering it in `<body>` with `fixed`
 * coordinates takes it out of every overflow container.
 */
export function useFloatingPanel(
  anchor: Ref<HTMLElement | null>,
  panel: Ref<HTMLElement | null>,
  align: () => 'left' | 'right',
) {
  const position = ref<PanelPosition>({ top: 0, left: 0 })
  /** False until the first measurement — the panel stays hidden, no flash at (0,0). */
  const placed = ref(false)

  function update(): void {
    if (!anchor.value || !panel.value) return
    const box = panel.value.getBoundingClientRect()
    position.value = placePanel(
      anchor.value.getBoundingClientRect(),
      { width: box.width, height: box.height },
      align(),
      { width: window.innerWidth, height: window.innerHeight },
    )
    placed.value = true
  }

  // Capture phase: a scroll inside any container (the table) moves the anchor too.
  function start(): void {
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
  }
  function stop(): void {
    placed.value = false
    window.removeEventListener('scroll', update, true)
    window.removeEventListener('resize', update)
  }
  onUnmounted(stop)

  return { position, placed, update, start, stop }
}
