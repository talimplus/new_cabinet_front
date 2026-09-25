export interface TabItem {
  /** Value written back through `v-model`. */
  key: string
  /** i18n KEY — `UiTabs` translates it, so config objects stay text-free. */
  labelKey: string
  /** Optional count pill, e.g. how many rows the tab holds. */
  badge?: number
  /** Draws the badge in the danger tone — for counts that need attention. */
  badgeAlert?: boolean
  /** De-emphasises the tab when it is not selected (e.g. a past month). */
  muted?: boolean
}
