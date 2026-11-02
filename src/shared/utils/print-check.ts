/**
 * Receipt printing. The markup is rendered once by `CheckSlip` and then
 * copied into a throw-away iframe so the cabinet's own stylesheet (dark theme,
 * Tailwind resets) cannot reach the printer.
 *
 * No `@page size` is forced: the slip fills whatever paper is picked in the
 * print dialog. Base styles target the narrowest roll (58mm → ~48mm printable);
 * the media queries below step the type up for 80mm rolls and cap the width on
 * A4, so one stylesheet serves every printer. Thermal heads print black only,
 * so there are no greys — they come out as speckles.
 */
const PRINT_STYLES = `
  @page { margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Arial, "Helvetica Neue", sans-serif; margin: 0; padding: 1.5mm; color: #000; }
  .check { width: 100%; max-width: 76mm; margin: 0 auto; padding-bottom: 3mm; break-inside: avoid; }
  .check + .check { border-top: 1px dashed #000; padding-top: 3mm; margin-top: 2mm; }
  .check-header { text-align: center; margin-bottom: 2mm; border-bottom: 1px solid #000; padding-bottom: 1.5mm; }
  .check-brand { font-size: 11px; font-weight: 700; text-transform: uppercase; overflow-wrap: anywhere; }
  .check-no { font-size: 18px; font-weight: 800; margin-top: 1mm; overflow-wrap: anywhere; }
  .check-pending { margin-top: 1mm; font-size: 10px; font-weight: 700; border: 1px solid #000; padding: 0.5mm 1mm; display: inline-block; }
  .check-table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
  .check-table td { padding: 0.8mm 0; vertical-align: top; border-bottom: 1px dotted #000; line-height: 1.25; }
  .check-table td.k { width: 42%; padding-right: 1.5mm; overflow-wrap: anywhere; }
  .check-table td.v { text-align: right; font-weight: 700; overflow-wrap: anywhere; }
  .check-table tr:last-child td { border-bottom: 0; }
  .check-total { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 1mm 2mm;
    margin-top: 2mm; padding-top: 1.5mm; border-top: 1px solid #000; }
  .check-total-label { font-size: 10px; font-weight: 700; text-transform: uppercase; }
  .check-total-value { font-size: 15px; font-weight: 800; text-align: right; white-space: nowrap; margin-left: auto; }

  /* 80mm roll (~72mm printable) and wider */
  @media (min-width: 64mm) {
    body { padding: 2mm; }
    .check-brand { font-size: 13px; }
    .check-no { font-size: 22px; }
    .check-pending { font-size: 11px; }
    .check-table, .check-total-label { font-size: 12px; }
    .check-table td { padding: 1mm 0; }
    .check-table td.k { width: 45%; }
    .check-total-value { font-size: 18px; }
  }

  /* A4 / Letter: keep the slip receipt-sized and centred; a page margin (not
     body padding) so every page, not just the first, clears the paper edge */
  @media (min-width: 120mm) {
    @page { margin: 12mm; }
    body { padding: 0; }
  }
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
