import { StudentStatus } from '../enums/student-status.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

export interface StudentPageFilters {
  subject: boolean
  preferredTime: boolean
  preferredDays: boolean
  returnLikelihood: boolean
}

export interface StudentPageConfig {
  titleKey: string
  status: StudentStatus
  columns: TableColumn[]
  showCreate: boolean
  filters: StudentPageFilters
}

/**
 * `label` holds an i18n KEY, not text — StudentsView translates the columns so
 * a language switch relabels the table without a reload.
 */
const BASE: TableColumn[] = [
  { key: 'id', label: 'students.table.id', hideOnMobile: true },
  { key: 'firstName', label: 'students.table.firstName', primary: true },
  { key: 'lastName', label: 'students.table.lastName' },
  { key: 'phone', label: 'students.table.phone' },
]

const STATUS_COL: TableColumn = { key: 'status', label: 'students.table.status' }
const NO_FILTERS: StudentPageFilters = {
  subject: false, preferredTime: false, preferredDays: false, returnLikelihood: false,
}

/** One config per student page; the router passes `variant` and StudentsView reads this. */
export const STUDENT_PAGES: Record<string, StudentPageConfig> = {
  reception: {
    titleKey: 'students.titles.reception',
    status: StudentStatus.NEW,
    showCreate: true,
    filters: { subject: true, preferredTime: true, preferredDays: true, returnLikelihood: false },
    columns: [
      ...BASE,
      { key: 'subject', label: 'students.table.subject' },
      { key: 'monthlyFee', label: 'students.table.monthlyFee', align: 'right' },
      { key: 'preferredTime', label: 'students.table.preferredTime' },
      { key: 'preferredDays', label: 'students.table.preferredDays' },
      STATUS_COL,
    ],
  },
  active: {
    titleKey: 'students.titles.list',
    status: StudentStatus.ACTIVE,
    showCreate: false,
    filters: NO_FILTERS,
    columns: [
      ...BASE,
      { key: 'birthDate', label: 'students.table.birthDate' },
      { key: 'monthlyFee', label: 'students.table.monthlyFee', align: 'right' },
      { key: 'discount', label: 'students.table.discount' },
      STATUS_COL,
    ],
  },
  stopped: {
    titleKey: 'students.titles.stopped',
    status: StudentStatus.STOPPED,
    showCreate: false,
    filters: { ...NO_FILTERS, returnLikelihood: true },
    columns: [
      ...BASE,
      { key: 'birthDate', label: 'students.table.birthDate' },
      { key: 'returnLikelihood', label: 'students.table.returnLikelihood' },
      { key: 'comment', label: 'students.table.comment' },
      STATUS_COL,
    ],
  },
  ignored: {
    titleKey: 'students.titles.ignored',
    status: StudentStatus.IGNORED,
    showCreate: false,
    filters: { ...NO_FILTERS, returnLikelihood: true },
    columns: [
      ...BASE,
      { key: 'birthDate', label: 'students.table.birthDate' },
      { key: 'returnLikelihood', label: 'students.table.returnLikelihood' },
      { key: 'comment', label: 'students.table.comment' },
      STATUS_COL,
    ],
  },
  finished: {
    titleKey: 'students.titles.finished',
    status: StudentStatus.FINISHED,
    showCreate: false,
    filters: NO_FILTERS,
    columns: [
      ...BASE,
      { key: 'birthDate', label: 'students.table.birthDate' },
      { key: 'monthlyFee', label: 'students.table.monthlyFee', align: 'right' },
      { key: 'discount', label: 'students.table.discount' },
      STATUS_COL,
    ],
  },
}
