import { computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { Permission } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'

/** Base role types that act as "manager level" in the business rules of §7. */
const MANAGER_LEVEL: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]

/**
 * The app's authorization surface. Every flag is a **permission key** check —
 * never a role check — so a custom role an admin invents works immediately
 * (`docs/03-roles-permissions.md`).
 *
 * These flags only hide/disable UI; the backend 403 is the real protection, and
 * the request interceptor additionally drops calls the user has no key for.
 *
 * The handful of behaviors that genuinely depend on WHO the person is (not what
 * they may do) live in the clearly named `isTeacher` / `isOwner` /
 * `canEditLessonPlan` helpers below — see §7 of the doc.
 */
export function usePermissions() {
  const userStore = useUserStore()

  const role = computed<UserRole | null>(() => userStore.user?.role ?? null)
  const userId = computed<number | null>(() => userStore.user?.id ?? null)
  const can = (...keys: Permission[]): boolean => userStore.can(...keys)

  // ---- base role type (business rules only — §7) ----
  const isTeacher = computed(() => role.value === UserRole.TEACHER)
  const isReception = computed(() => role.value === UserRole.RECEPTION)
  const isOwner = computed(
    () => role.value === UserRole.ADMIN || role.value === UserRole.SUPER_ADMIN,
  )
  const isManagerLevel = computed(() => role.value !== null && MANAGER_LEVEL.includes(role.value))

  return {
    role,
    userId,
    can,
    isTeacher,
    isReception,
    isOwner,
    isManagerLevel,

    // ---- students ----
    canViewStudents: computed(() => can(Permission.STUDENTS_VIEW)),
    canCreateStudent: computed(() => can(Permission.STUDENTS_CREATE)),
    canEditStudent: computed(() => can(Permission.STUDENTS_UPDATE)),
    canDeleteStudent: computed(() => can(Permission.STUDENTS_DELETE)),
    canChangeStudentStatus: computed(() => can(Permission.STUDENTS_CHANGE_STATUS)),
    canManageDiscounts: computed(() => can(Permission.STUDENTS_DISCOUNTS)),
    canTransferStudents: computed(() => can(Permission.STUDENTS_TRANSFER)),

    // ---- leads ----
    canViewLeads: computed(() => can(Permission.LEADS_VIEW)),
    canCreateLead: computed(() => can(Permission.LEADS_CREATE)),
    canEditLead: computed(() => can(Permission.LEADS_UPDATE)),
    canDeleteLead: computed(() => can(Permission.LEADS_DELETE)),
    canTransferLead: computed(() => can(Permission.LEADS_TRANSFER)),

    // ---- groups ----
    canViewGroups: computed(() => can(Permission.GROUPS_VIEW)),
    canCreateGroup: computed(() => can(Permission.GROUPS_CREATE)),
    canEditGroup: computed(() => can(Permission.GROUPS_UPDATE)),
    canDeleteGroup: computed(() => can(Permission.GROUPS_DELETE)),
    canChangeGroupStatus: computed(() => can(Permission.GROUPS_CHANGE_STATUS)),

    // ---- attendance (students) ----
    canViewAttendance: computed(() => can(Permission.ATTENDANCE_VIEW)),
    canManageAttendance: computed(() => can(Permission.ATTENDANCE_MANAGE)),
    canManagePastAttendance: computed(() => can(Permission.ATTENDANCE_MANAGE_PAST)),

    // ---- staff attendance (check-in) ----
    canCheckIn: computed(() => can(Permission.STAFF_ATTENDANCE_CHECK_IN)),
    canViewStaffAttendance: computed(() => can(Permission.STAFF_ATTENDANCE_VIEW)),
    canManageStaffAttendance: computed(() => can(Permission.STAFF_ATTENDANCE_MANAGE)),

    // ---- syllabus / lesson plan ----
    canViewSyllabus: computed(() => can(Permission.SYLLABUS_VIEW)),
    canManageSyllabus: computed(() => can(Permission.SYLLABUS_MANAGE)),
    canUseSyllabusAi: computed(() => can(Permission.SYLLABUS_AI)),
    canViewGroupPlan: computed(() => can(Permission.GROUP_PLAN_VIEW)),
    /** Attach/replace a group's syllabus — teachers deliberately lack this. */
    canAttachGroupSyllabus: computed(() => can(Permission.GROUP_PLAN_ATTACH)),

    // ---- payments ----
    canViewPayments: computed(() => can(Permission.PAYMENTS_VIEW)),
    canTakePayment: computed(() => can(Permission.PAYMENTS_CREATE)),
    canExportPayments: computed(() => can(Permission.PAYMENTS_EXPORT)),
    canRecalculatePayment: computed(() => can(Permission.PAYMENTS_RECALCULATE)),
    /** Editing the planned study-until date — the recalculation saves through it. */
    canEditPayment: computed(() => can(Permission.PAYMENTS_UPDATE)),
    canExcludeLessons: computed(() => can(Permission.PAYMENTS_EXCLUSION)),

    // ---- receipts ----
    canViewReceipts: computed(() => can(Permission.RECEIPTS_VIEW)),
    canConfirmReceipt: computed(() => can(Permission.RECEIPTS_CONFIRM)),
    canRejectReceipt: computed(() => can(Permission.RECEIPTS_REJECT)),

    // ---- payroll / expenses ----
    canViewPayroll: computed(() => can(Permission.PAYROLL_VIEW)),
    canPaySalary: computed(() => can(Permission.PAYROLL_PAY)),
    canDeductSalary: computed(() => can(Permission.PAYROLL_DEDUCT)),
    /** Opening another employee's page: attendance, unsettled money, fines. */
    canViewStaffPerformance: computed(() => can(Permission.STAFF_PERFORMANCE_VIEW)),
    canViewExpenses: computed(() => can(Permission.EXPENSES_VIEW)),
    canCreateExpense: computed(() => can(Permission.EXPENSES_CREATE)),
    canEditExpense: computed(() => can(Permission.EXPENSES_UPDATE)),
    canDeleteExpense: computed(() => can(Permission.EXPENSES_DELETE)),

    // ---- settings ----
    canViewUsers: computed(() => can(Permission.USERS_VIEW)),
    /** GET /users/teachers is open to anyone who manages groups or students. */
    canViewTeachers: computed(() =>
      can(Permission.USERS_VIEW, Permission.GROUPS_VIEW, Permission.STUDENTS_VIEW),
    ),
    canCreateUser: computed(() => can(Permission.USERS_CREATE)),
    canEditUser: computed(() => can(Permission.USERS_UPDATE)),
    canDeleteUser: computed(() => can(Permission.USERS_DELETE)),
    canViewRoles: computed(() => can(Permission.ROLES_VIEW)),
    canManageRoles: computed(() => can(Permission.ROLES_MANAGE)),
    canViewCenters: computed(() => can(Permission.CENTERS_VIEW)),
    canManageCenters: computed(() => can(Permission.CENTERS_MANAGE)),
    canManageRooms: computed(() => can(Permission.ROOMS_MANAGE)),
    canManageSubjects: computed(() => can(Permission.SUBJECTS_MANAGE)),

    /**
     * §7 business rule: editing a group's lesson plan needs `groupPlan.manage`
     * AND either manager level or being that group's own teacher.
     */
    canEditLessonPlan: (isOwnGroup: boolean): boolean =>
      can(Permission.GROUP_PLAN_MANAGE) && (isManagerLevel.value || isOwnGroup),
  }
}
