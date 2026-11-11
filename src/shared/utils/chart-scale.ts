/**
 * A clean y axis for `max`: 0 and `count` equal steps of 1/2/2.5/5 × 10ⁿ
 * whose last tick covers `max`. An empty chart still gets a 0…1 axis.
 */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1]
  const raw = max / count
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow
  const ticks: number[] = []
  for (let v = 0; v < max + step / 2; v += step) ticks.push(Math.round(v * 1000) / 1000)
  if (ticks[ticks.length - 1]! < max) ticks.push(ticks[ticks.length - 1]! + step)
  return ticks
}

/** Short axis label: 1200000 → "1.2M", 2000000 → "2M", 500000 → "500k", 750 → "750". */
export function formatCompact(value: number): string {
  const trim = (n: number): string => String(Math.round(n * 10) / 10)
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${trim(value / 1_000_000_000)}B`
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`
  if (abs >= 1_000) return `${trim(value / 1_000)}k`
  return trim(value)
}
