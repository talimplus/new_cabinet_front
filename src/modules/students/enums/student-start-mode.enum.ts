/** Why the student start-date dialog is open. UI-only; never sent to the backend. */
export enum StudentStartMode {
  /** First activation (new/ignored → ACTIVE): pick the day the student really started. */
  ACTIVATE = 'activate',
  /** Edit form added groups with a past join date — confirm the payment impact. */
  JOIN = 'join',
}
