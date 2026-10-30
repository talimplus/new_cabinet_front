/** Why the start-date dialog is open. UI-only; never sent to the backend. */
export enum GroupStartMode {
  /** NEW → STARTED: the user picks the day lessons really began. */
  START = 'start',
  /** Edit form: the start date was changed — confirm the payment impact. */
  EDIT = 'edit',
}
