/** Which set the bulk-confirm dialog is about to approve. */
export enum BulkConfirmMode {
  /** Only the receipts ticked by hand (`receiptIds`). */
  SELECTED = 'selected',
  /** Everything matching the current filters (`all: true` + the filters). */
  ALL = 'all',
}
