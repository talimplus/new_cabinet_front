/** A row of the salaries inner page: a salary payment or an advance. */
export enum SalaryEntryKind {
  SALARY = 'salary',
  ADVANCE = 'advance',
}

export const SALARY_ENTRY_KIND_LABEL_KEYS: Record<SalaryEntryKind, string> = {
  [SalaryEntryKind.SALARY]: 'statistics.detail.salaries.salary',
  [SalaryEntryKind.ADVANCE]: 'statistics.detail.salaries.advance',
}
