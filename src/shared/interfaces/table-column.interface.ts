export interface TableColumn {
  /** Field key on the row object; also the `cell-<key>` slot name. */
  key: string
  label: string
  align?: 'left' | 'right'
  /**
   * On mobile this column becomes the card's heading instead of a
   * label/value row. Defaults to the first column when none is marked.
   */
  primary?: boolean
  /** Left out of the mobile card — for noise like IDs. */
  hideOnMobile?: boolean
  /**
   * Renders the row's ordinal (`rowOffset + 1, 2, …`) instead of a field — the
   * "№" column that replaces database IDs. Desktop only, like `hideOnMobile`.
   */
  rowNumber?: boolean
}
