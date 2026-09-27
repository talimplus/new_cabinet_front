import { AppLocale } from '@/shared/enums/app-locale.enum'

import uzAbsences from './uz/absences'
import uzAuth from './uz/auth'
import uzCenters from './uz/centers'
import uzCommon from './uz/common'
import uzExpenses from './uz/expenses'
import uzGroups from './uz/groups'
import uzHolidays from './uz/holidays'
import uzLayout from './uz/layout'
import uzLeads from './uz/leads'
import uzOrganization from './uz/organization'
import uzPayments from './uz/payments'
import uzPayroll from './uz/payroll'
import uzPendingReceipts from './uz/pendingReceipts'
import uzProfile from './uz/profile'
import uzRoles from './uz/roles'
import uzRooms from './uz/rooms'
import uzSchedule from './uz/schedule'
import uzStaff from './uz/staff'
import uzStaffAttendance from './uz/staffAttendance'
import uzStatistics from './uz/statistics'
import uzStudents from './uz/students'
import uzSubjects from './uz/subjects'
import uzSyllabuses from './uz/syllabuses'
import uzTelegram from './uz/telegram'
import uzUsers from './uz/users'

import ruAbsences from './ru/absences'
import ruAuth from './ru/auth'
import ruCenters from './ru/centers'
import ruCommon from './ru/common'
import ruExpenses from './ru/expenses'
import ruGroups from './ru/groups'
import ruHolidays from './ru/holidays'
import ruLayout from './ru/layout'
import ruLeads from './ru/leads'
import ruOrganization from './ru/organization'
import ruPayments from './ru/payments'
import ruPayroll from './ru/payroll'
import ruPendingReceipts from './ru/pendingReceipts'
import ruProfile from './ru/profile'
import ruRoles from './ru/roles'
import ruRooms from './ru/rooms'
import ruSchedule from './ru/schedule'
import ruStaff from './ru/staff'
import ruStaffAttendance from './ru/staffAttendance'
import ruStatistics from './ru/statistics'
import ruStudents from './ru/students'
import ruSubjects from './ru/subjects'
import ruSyllabuses from './ru/syllabuses'
import ruTelegram from './ru/telegram'
import ruUsers from './ru/users'

/**
 * One namespace per domain — the same 23 namespaces the old cabinet_front used,
 * so its already-translated keys carry over unchanged.
 */
export const messages = {
  [AppLocale.UZ]: {
    absences: uzAbsences,
    auth: uzAuth,
    centers: uzCenters,
    common: uzCommon,
    expenses: uzExpenses,
    groups: uzGroups,
    holidays: uzHolidays,
    layout: uzLayout,
    leads: uzLeads,
    organization: uzOrganization,
    payments: uzPayments,
    payroll: uzPayroll,
    pendingReceipts: uzPendingReceipts,
    profile: uzProfile,
    roles: uzRoles,
    rooms: uzRooms,
    schedule: uzSchedule,
    staff: uzStaff,
    staffAttendance: uzStaffAttendance,
    statistics: uzStatistics,
    students: uzStudents,
    subjects: uzSubjects,
    syllabuses: uzSyllabuses,
    telegram: uzTelegram,
    users: uzUsers,
  },
  [AppLocale.RU]: {
    absences: ruAbsences,
    auth: ruAuth,
    centers: ruCenters,
    common: ruCommon,
    expenses: ruExpenses,
    groups: ruGroups,
    holidays: ruHolidays,
    layout: ruLayout,
    leads: ruLeads,
    organization: ruOrganization,
    payments: ruPayments,
    payroll: ruPayroll,
    pendingReceipts: ruPendingReceipts,
    profile: ruProfile,
    roles: ruRoles,
    rooms: ruRooms,
    schedule: ruSchedule,
    staff: ruStaff,
    staffAttendance: ruStaffAttendance,
    statistics: ruStatistics,
    students: ruStudents,
    subjects: ruSubjects,
    syllabuses: ruSyllabuses,
    telegram: ruTelegram,
    users: ruUsers,
  },
}
