/** One option in a UiSelect. Extra keys are allowed so callers can point
 * `optionLabel` / `optionValue` at custom fields (e.g. `name` / `id`). */
export interface SelectOption {
  label?: string
  value?: string | number
  disabled?: boolean
  [key: string]: unknown
}
