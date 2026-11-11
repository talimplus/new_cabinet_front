/** How `useQueryState` reads / writes one field in the URL query. */
export enum QueryParam {
  STRING = 'string',
  NUMBER = 'number',
  /** `1` / `0` in the URL. */
  BOOLEAN = 'boolean',
  /** A `Date` object in state, `YYYY-MM-DD` in the URL. */
  DATE = 'date',
  /** A `YYYY-MM-DD` or `YYYY-MM` string in state and in the URL (validated). */
  DATE_STRING = 'date-string',
  /** `a,b,c` in the URL. */
  STRING_ARRAY = 'string-array',
  NUMBER_ARRAY = 'number-array',
}
