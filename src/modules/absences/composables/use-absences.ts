import { ref, reactive, computed } from 'vue'
import { fetchAbsences, saveAbsenceFollowUp } from '../api/absences.api'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { FollowUpFilter } from '../enums/follow-up-filter.enum'
import { useNotificationStore } from '@/stores/notification.store'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { toDateString } from '@/shared/utils/format-date'
import { debounce } from '@/shared/utils/debounce'
import { t } from '@/locales'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { Absence, AbsenceSummary } from '../interfaces/absence.interface'
import type { AbsencesParams } from '../interfaces/absence-params.interface'

export interface AbsencesFilters {
  from: string
  to: string
  groupId: number | null
  teacherId: number | null
  status: AttendanceStatus.ABSENT | AttendanceStatus.EXCUSED | null
  followUp: FollowUpFilter
  search: string
  page: number
  perPage: number
}

export interface FollowUpState {
  row: Absence | null
  note: string
  saving: boolean
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateString(d)
}

/**
 * `/absences` — reception's call list: students who missed a lesson, with
 * filters (dates, group, teacher, absence kind, called / not called) and the
 * "record the call result" modal.
 */
export function useAbsences() {
  const notify = useNotificationStore()

  // Default: the last week, not yet called — the reception's daily work queue.
  const filters = reactive<AbsencesFilters>({
    from: daysAgo(7),
    to: toDateString(new Date()),
    groupId: null,
    teacherId: null,
    status: null,
    followUp: FollowUpFilter.PENDING,
    search: '',
    page: 1,
    perPage: 20,
  })

  const rows = ref<Absence[]>([])
  const summary = ref<AbsenceSummary>({ absent: 0, excused: 0, notFollowedUp: 0 })
  const totalPages = ref(1)
  const loading = ref(false)
  const groupOptions = ref<SelectOption[]>([])
  const teacherOptions = ref<SelectOption[]>([])
  const followUp = reactive<FollowUpState>({ row: null, note: '', saving: false })
  const followUpOpen = computed(() => followUp.row !== null)

  function params(): AbsencesParams {
    return {
      page: filters.page,
      perPage: filters.perPage,
      from: filters.from || undefined,
      to: filters.to || undefined,
      groupId: filters.groupId ?? undefined,
      teacherId: filters.teacherId ?? undefined,
      status: filters.status ?? undefined,
      followedUp:
        filters.followUp === FollowUpFilter.ALL
          ? undefined
          : filters.followUp === FollowUpFilter.DONE,
      search: filters.search.trim() || undefined,
    }
  }

  // Only the latest request may write the list: a slow earlier response (the
  // debounced search, a previous filter) must not overwrite newer rows.
  let requestSeq = 0
  async function load(): Promise<void> {
    const seq = ++requestSeq
    loading.value = true
    try {
      const res = await fetchAbsences(params())
      if (seq !== requestSeq) return
      rows.value = res.data
      summary.value = res.summary
      totalPages.value = res.meta.totalPages || 1
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  /** Groups follow the teacher filter — an unrelated group can't stay selected. */
  async function loadGroups(): Promise<void> {
    const groups = await optionalRequest(
      fetchAllGroups(undefined, filters.teacherId ?? undefined),
      [],
    )
    groupOptions.value = groups.map((g) => ({ label: g.name, value: g.id }))
    if (filters.groupId && !groups.some((g) => g.id === filters.groupId)) {
      filters.groupId = null
    }
  }

  async function loadTeachers(): Promise<void> {
    const teachers = await optionalRequest(fetchTeachers(), [])
    teacherOptions.value = teachers.map((x) => ({
      label: `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim() || `#${x.id}`,
      value: x.id,
    }))
  }

  async function init(): Promise<void> {
    await Promise.all([load(), loadGroups(), loadTeachers()])
  }

  function reload(): void {
    filters.page = 1
    void load()
  }
  const reloadDebounced = debounce(reload)

  /** Filter change from the filters bar → reload from page 1. */
  function setFilters(patch: Partial<AbsencesFilters>): void {
    Object.assign(filters, patch)
    reload()
  }
  /** Search typing → debounced reload. */
  function setSearch(value: string): void {
    filters.search = value
    reloadDebounced()
  }
  function setNote(value: string): void {
    followUp.note = value
  }

  /** Groups first: a group of the previous teacher must not be sent along. */
  async function setTeacher(id: number | null): Promise<void> {
    filters.teacherId = id
    await loadGroups()
    reload()
  }

  function setPage(page: number): void {
    filters.page = page
    void load()
  }

  function openFollowUp(row: Absence): void {
    followUp.row = row
    followUp.note = row.followUpNote ?? ''
  }
  function closeFollowUp(): void {
    if (followUp.saving) return
    followUp.row = null
  }

  async function submitFollowUp(): Promise<void> {
    if (!followUp.row) return
    followUp.saving = true
    try {
      await saveAbsenceFollowUp(followUp.row.id, { note: followUp.note.trim() })
      notify.success(t('absences.messages.saved'))
      followUp.row = null
      await load()
    } finally {
      followUp.saving = false
    }
  }

  return {
    filters, rows, summary, totalPages, loading,
    groupOptions, teacherOptions, followUp, followUpOpen,
    init, load, reload, reloadDebounced, setFilters, setSearch, setNote, setTeacher, setPage,
    openFollowUp, closeFollowUp, submitFollowUp,
  }
}
