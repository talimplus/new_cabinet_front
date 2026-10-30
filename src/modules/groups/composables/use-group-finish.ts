import { computed, reactive, ref } from 'vue'
import { createGroup, fetchAllGroups, fetchGroupMembers, finishGroup } from '../api/groups.api'
import { useNotificationStore } from '@/stores/notification.store'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { usePermissions } from '@/shared/composables/use-permissions'
import { GroupStatus } from '../enums/group-status.enum'
import { toDateString } from '@/shared/utils/format-date'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm } from '../interfaces/group-form.interface'
import type { GroupMember } from '../interfaces/group-member.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

const DAY = 24 * 60 * 60 * 1000

/**
 * "Guruhni yakunlash" — one dialog for the course-over / group-closed case:
 * the last lesson day, which students move on (to an existing group or one
 * created right here, prefilled from this group) and which simply finish.
 * Everything goes to the backend in ONE request (`POST /groups/:id/finish`).
 */
export function useGroupFinish(onDone: () => void) {
  const notify = useNotificationStore()
  const perms = usePermissions()
  /** Moving needs `students.transfer`; without it the group can only be closed. */
  const canMove = computed(() => perms.canTransferStudents.value)
  /** The inline "new group" form needs `groups.create`. */
  const canCreate = computed(() => perms.canCreateGroup.value)

  const state = reactive({
    open: false,
    group: null as Group | null,
    endDate: new Date() as Date | null,
    /** false — nobody moves, the group just closes. */
    move: true,
    targetGroupId: null as number | null,
    createOpen: false,
  })
  const members = ref<GroupMember[]>([])
  const selected = ref<number[]>([])
  const groupOptions = ref<SelectOption[]>([])
  const loading = ref(false)
  const saving = ref(false)

  async function open(group: Group): Promise<void> {
    Object.assign(state, { open: true, group, endDate: new Date(), move: canMove.value, targetGroupId: null, createOpen: false })
    loading.value = true
    try {
      const [list, groups] = await Promise.all([
        fetchGroupMembers(group.id),
        optionalRequest(fetchAllGroups(group.center?.id), [] as Group[]),
      ])
      members.value = list.filter((m) => m.isCurrent)
      selected.value = members.value.map((m) => m.studentId)
      groupOptions.value = groups
        .filter((g) => g.id !== group.id && g.status !== GroupStatus.FINISHED)
        .map((g) => ({ label: g.name, value: g.id }))
    } finally {
      loading.value = false
    }
  }

  function toggle(id: number, on: boolean): void {
    selected.value = on ? [...new Set([...selected.value, id])] : selected.value.filter((x) => x !== id)
  }
  function toggleAll(on: boolean): void {
    selected.value = on ? members.value.map((m) => m.studentId) : []
  }

  const moving = computed(() => (state.move ? selected.value.length : 0))
  const finishing = computed(() => members.value.length - moving.value)
  /** Debt stays in this group for everyone — moved students too. */
  const debtStaying = computed(() => members.value.reduce((s, m) => s + (m.debt ?? 0), 0))
  const canSubmit = computed(
    () => !!state.endDate && !loading.value && (!moving.value || state.targetGroupId != null),
  )

  /** The next group, prefilled from this one: starts the day after the last lesson. */
  const template = computed<Group | null>(() => {
    const g = state.group
    if (!g || !state.endDate) return null
    const start = new Date(state.endDate.getTime() + DAY)
    const oldStart = g.startDate ? new Date(g.startDate).getTime() : null
    const oldEnd = g.endDate ? new Date(g.endDate).getTime() : null
    const end = oldStart && oldEnd ? new Date(start.getTime() + (oldEnd - oldStart)) : null
    return {
      ...g, id: 0, name: `${g.name} (2)`, status: GroupStatus.NEW, upcomingMonthlyFee: null,
      startDate: toDateString(start), endDate: end ? toDateString(end) : null,
    }
  })

  async function createTarget(form: GroupForm): Promise<void> {
    const created = await createGroup(form)
    groupOptions.value = [{ label: created.name, value: created.id }, ...groupOptions.value]
    state.targetGroupId = created.id
    state.createOpen = false
  }

  async function submit(): Promise<void> {
    const g = state.group
    const endDate = toDateString(state.endDate)
    if (!g || !endDate || !canSubmit.value) return
    saving.value = true
    try {
      const res = await finishGroup(g.id, {
        endDate,
        targetGroupId: moving.value ? (state.targetGroupId ?? undefined) : undefined,
        studentIds: moving.value ? [...selected.value] : undefined,
      })
      notify.success(t('groups.finish.done', { moved: res.transferred, finished: res.finishedStudents }))
      state.open = false
      onDone()
    } finally {
      saving.value = false
    }
  }

  return {
    state, members, selected, groupOptions, loading, saving, canMove, canCreate,
    moving, finishing, debtStaying, canSubmit, template,
    open, toggle, toggleAll, createTarget, submit,
  }
}
