/**
 * Hand a generated file (Excel export, PDF, …) to the browser's downloader.
 * The object URL is revoked right away — the click has already started the save.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
