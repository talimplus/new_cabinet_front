import { computed, reactive, ref } from 'vue'
import { fetchHolidays, createHoliday, deleteHoliday } from '../api/holidays.api'
import { useNotificationStore } from '@/stores/notification.store'
import { useScopeStore } from '@/stores/scope.store'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { Holiday } from '../interfaces/holiday.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

export interface HolidayFormState {
  open: boolean
  fromDate: Date | null
  toDate: Date | null
  name: string
  /** Only for the active center (admin with a center picked); else org-wide. */
  onlyActiveCenter: boolean
  saving: boolean
  errors: Record<string, string>
}

/** `/holidays` — days with no lessons in any group (Navro'z, Independence Day…). */
export function useHolidays() {
  const notify = useNotificationStore()
  const scope = useScopeStore()

  const year = ref(new Date().getFullYear())
  const rows = ref<Holiday[]>([])
  const loading = ref(false)
  const pendingDelete = ref<Holiday | null>(null)
  const deleting = ref(false)
  const form = reactive<HolidayFormState>({
    open: false, fromDate: null, toDate: null, name: '', onlyActiveCenter: false, saving: false, errors: {},
  })

  const yearOptions = computed<SelectOption[]>(() => {
    const now = new Date().getFullYear()
    return [now - 1, now, now + 1].map((y) => ({ label: String(y), value: y }))
  })
  /** An admin with a concrete center picked may scope a holiday to it. */
  const canScopeToCenter = computed(() => scope.canSwitch && scope.activeCenter !== null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      rows.value = await fetchHolidays({ year: year.value })
    } finally {
      loading.value = false
    }
  }

  function setYear(value: number): void {
    year.value = value
    void load()
  }

  function openForm(): void {
    Object.assign(form, { open: true, fromDate: null, toDate: null, name: '', onlyActiveCenter: false, errors: {} })
  }
  function setField(patch: Partial<Pick<HolidayFormState, 'fromDate' | 'toDate' | 'name' | 'onlyActiveCenter'>>): void {
    Object.assign(form, patch)
  }
  function closeForm(): void {
    if (!form.saving) form.open = false
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!form.fromDate) errors.fromDate = t('holidays.validation.fromDate')
    if (!form.toDate) errors.toDate = t('holidays.validation.toDate')
    else if (form.fromDate && form.toDate < form.fromDate) errors.toDate = t('holidays.validation.range')
    if (!form.name.trim()) errors.name = t('holidays.validation.name')
    form.errors = errors
    return Object.keys(errors).length === 0
  }

  async function submit(): Promise<void> {
    if (!validate()) return
    form.saving = true
    try {
      await createHoliday({
        fromDate: toDateString(form.fromDate),
        toDate: toDateString(form.toDate),
        name: form.name.trim(),
        centerId: canScopeToCenter.value && form.onlyActiveCenter ? scope.activeCenterId : null,
      })
      notify.success(t('holidays.messages.created'))
      form.open = false
      await load()
    } catch (e) {
      form.errors = mapBackendErrors(e)
    } finally {
      form.saving = false
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete.value) return
    deleting.value = true
    try {
      await deleteHoliday(pendingDelete.value.id)
      notify.success(t('holidays.messages.deleted'))
      pendingDelete.value = null
      await load()
    } finally {
      deleting.value = false
    }
  }

  /** Center name for a row (`null` → "all centers"). */
  function centerLabel(centerId: number | null): string {
    if (centerId === null) return t('holidays.allCenters')
    return scope.centers.find((c) => c.id === centerId)?.name ?? `#${centerId}`
  }

  return {
    year, yearOptions, rows, loading, form, pendingDelete, deleting, canScopeToCenter,
    activeCenterName: computed(() => scope.activeCenter?.name ?? ''),
    load, setYear, openForm, setField, closeForm, submit, confirmDelete, centerLabel,
  }
}
