/**
 * Receipt printing. The markup is rendered once by `CheckSlip` and then
 * copied into a throw-away iframe so the cabinet's own stylesheet (dark theme,
 * Tailwind resets) cannot reach the printer. Sizes target a narrow 58–80mm
 * thermal roll but stay readable on A4.
 */
const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: Arial, "Helvetica Neue", sans-serif; margin: 0; padding: 16px; color: #000; }
  .check { max-width: 320px; margin: 0 auto 24px; padding-bottom: 12px; }
  .check + .check { border-top: 1px dashed #999; padding-top: 16px; }
  .check-header { text-align: center; margin-bottom: 12px; border-bottom: 1px solid #000; padding-bottom: 8px; }
  .check-brand { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .check-no { font-size: 26px; font-weight: 800; margin-top: 4px; }
  .check-pending { margin-top: 6px; font-size: 12px; font-weight: 700; color: #b26a00; }
  .check-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .check-table td { padding: 5px 4px; vertical-align: top; border-bottom: 1px dotted #ccc; }
  .check-table td.k { color: #555; white-space: nowrap; padding-right: 12px; }
  .check-table td.v { text-align: right; font-weight: 600; }
  .check-table tr:last-child td { border-bottom: 0; }
  .check-total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
    margin-top: 14px; padding-top: 10px; border-top: 1px solid #000; }
  .check-total-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .check-total-value { font-size: 18px; font-weight: 800; text-align: right; white-space: nowrap; }
`

/** Print the given DOM subtree in an isolated iframe; resolves after cleanup. */
export function printCheckArea(area: HTMLElement | null, title: string): void {
  if (!area) return

  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(frame)

  const win = frame.contentWindow
  if (!win) {
    frame.remove()
    return
  }

  win.document.open()
  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>` +
      `<style>${PRINT_STYLES}</style></head><body>${area.innerHTML}</body></html>`,
  )
  win.document.close()

  win.focus()
  win.print()
  // Safari keeps reading the document while the dialog is up — remove it after.
  setTimeout(() => frame.remove(), 500)
}
