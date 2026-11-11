import { onUnmounted, ref, shallowRef } from 'vue'
import type { ChartTooltipData } from '@/shared/interfaces/chart-tooltip.interface'

/** A focus that follows a pointer press within this window came from that press, not the keyboard. */
const PRESS_FOCUS_MS = 600

/** Listeners `v-bind` puts on one chart mark. */
export interface ChartTooltipHandlers {
  onPointerdown: (e: PointerEvent) => void
  onPointerenter: (e: PointerEvent) => void
  onPointerleave: (e: PointerEvent) => void
  onFocus: (e: FocusEvent) => void
  onBlur: () => void
  onClick: (e: MouseEvent) => void
}

/**
 * The hover layer of a chart: one tooltip per chart, shown by any mark.
 *
 * - mouse: shows on enter, hides on leave;
 * - keyboard: shows on focus, hides on blur;
 * - touch / pen: a tap toggles it, a tap anywhere else or a scroll closes it.
 *   The tap does not bubble — a mini bar inside a clickable table row must not
 *   open the row when the reader only asked for the number.
 *
 * Render `<UiChartTooltip :data="tip.data.value" :anchor="tip.anchor.value" />`
 * once in the chart and `v-bind="tip.bind(() => data)"` on every mark.
 */
export function useChartTooltip() {
  const data = shallowRef<ChartTooltipData | null>(null)
  const anchor = ref<DOMRect | null>(null)
  let target: Element | null = null
  let pointerType = ''
  let pressedAt = 0

  function onOutside(e: PointerEvent): void {
    if (target && !target.contains(e.target as Node)) hide()
  }
  function listen(on: boolean): void {
    if (on) {
      document.addEventListener('pointerdown', onOutside, true)
      window.addEventListener('scroll', hide, true)
      window.addEventListener('resize', hide)
    } else {
      document.removeEventListener('pointerdown', onOutside, true)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }

  function show(el: Element, value: ChartTooltipData): void {
    if (!target) listen(true)
    target = el
    anchor.value = el.getBoundingClientRect()
    data.value = value
  }
  function hide(): void {
    if (target) listen(false)
    target = null
    anchor.value = null
    data.value = null
  }

  function bind(get: () => ChartTooltipData): ChartTooltipHandlers {
    return {
      onPointerdown: (e) => {
        pointerType = e.pointerType
        pressedAt = Date.now()
      },
      onPointerenter: (e) => {
        if (e.pointerType === 'mouse') show(e.currentTarget as Element, get())
      },
      onPointerleave: (e) => {
        if (e.pointerType === 'mouse') hide()
      },
      onFocus: (e) => {
        if (Date.now() - pressedAt > PRESS_FOCUS_MS) show(e.currentTarget as Element, get())
      },
      onBlur: hide,
      onClick: (e) => {
        if (pointerType === 'mouse' || Date.now() - pressedAt > PRESS_FOCUS_MS) return
        e.stopPropagation()
        if (target === e.currentTarget) hide()
        else show(e.currentTarget as Element, get())
      },
    }
  }

  onUnmounted(hide)
  return { data, anchor, bind, show, hide }
}
