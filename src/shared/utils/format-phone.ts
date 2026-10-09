/**
 * Uzbek phone numbers. Until the masked input arrived the phone was a plain
 * text field, so the database holds every spelling: `97-752-20-14`,
 * `911111111`, `+998911111111`, `998 90 123 45 67`. These helpers read any of
 * them and show / store one form: `+998 97 752 20 14` / `+998977522014`.
 * A value that is not an Uzbek number is left exactly as typed.
 */
const UZ_CODE = '998'
const LOCAL_LENGTH = 9

export function phoneDigits(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '')
}

/** The 9 local digits (`977522014`), or null when `raw` is not an Uzbek number. */
export function uzLocalDigits(raw: string | null | undefined): string | null {
  const digits = phoneDigits(raw)
  if (digits.length === LOCAL_LENGTH) return digits
  if (digits.length === UZ_CODE.length + LOCAL_LENGTH && digits.startsWith(UZ_CODE)) {
    return digits.slice(UZ_CODE.length)
  }
  return null
}

/**
 * Digits for the masked input: the local part, the `998` prefix dropped (a
 * pasted full number), capped at 9. Partial values stay partial.
 */
export function editablePhoneDigits(raw: string | null | undefined): string {
  const local = uzLocalDigits(raw)
  if (local) return local
  const digits = phoneDigits(raw)
  // Only a full `998` + 9 digits counts as prefixed: `99 812 34 56` is a real
  // local number (Uzmobile), and one extra keystroke must not eat its `998`.
  const stripped = digits.length >= UZ_CODE.length + LOCAL_LENGTH && digits.startsWith(UZ_CODE)
    ? digits.slice(UZ_CODE.length)
    : digits
  return stripped.slice(0, LOCAL_LENGTH)
}

/** `977522014` → `97 752 20 14`; a partial value is grouped as far as it goes. */
export function groupLocalDigits(digits: string): string {
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(' ')
}

/** Display form: `+998 97 752 20 14`; '' for an empty value; anything else as is. */
export function formatPhone(raw: string | null | undefined): string {
  const local = uzLocalDigits(raw)
  if (local) return `+${UZ_CODE} ${groupLocalDigits(local)}`
  return (raw ?? '').trim()
}

/** Stored form: `+998977522014`; anything that is not an Uzbek number — trimmed as is. */
export function normalizePhone(raw: string | null | undefined): string {
  const local = uzLocalDigits(raw)
  return local ? `+${UZ_CODE}${local}` : (raw ?? '').trim()
}

/** `tel:` link target — digits and a leading plus only. */
export function phoneHref(raw: string | null | undefined): string {
  return `tel:${normalizePhone(raw).replace(/[^\d+]/g, '')}`
}

export function isValidUzPhone(raw: string | null | undefined): boolean {
  return uzLocalDigits(raw) !== null
}
