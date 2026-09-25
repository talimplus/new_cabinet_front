import { reactive, ref, watch } from 'vue'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { StudentPreferredTime } from '@/modules/students/enums/student-preferred-time.enum'
import { LeadStatus } from '../enums/lead-status.enum'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString, parseDate } from '@/shared/utils/format-date'
import type { Lead } from '../interfaces/lead.interface'
import type { LeadForm } from '../interfaces/lead-form.interface'
import type { LeadTransferForm } from '../interfaces/lead-transfer-form.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

/** Reactive edit state for a lead (dates stay as `Date`, numbers may be blank). */
export interface LeadFormState {
  firstName: string
  lastName: string
  phone: string
  secondPhone: string
  birthDate: Date | null
  monthlyFee: string | number
  heardAboutUs: string
  preferredTime: StudentPreferredTime | null
  preferredDays: WeekDay[]
  centerId: number | null
  groupIds: number[]
  passportSeries: string
  passportNumber: string
  jshshir: string
  discountPercent: string | number
  discountReason: string
  comment: string
  followUpDate: Date | null
}

function blankState(centerId: number | null): LeadFormState {
  return {
    firstName: '', lastName: '', phone: '', secondPhone: '', birthDate: null,
    monthlyFee: '', heardAboutUs: '', preferredTime: null, preferredDays: [],
    centerId, groupIds: [], passportSeries: '', passportNumber: '', jshshir: '',
    discountPercent: '', discountReason: '', comment: '', followUpDate: null,
  }
}

/**
 * Lead create/edit state. Owns the reactive form, the center-scoped group
 * options (reloaded when the center changes), validation and payload building.
 */
export function useLeadForm(defaultCenterId: () => number | null) {
  const form = reactive<LeadFormState>(blankState(defaultCenterId()))
  const errors = reactive<Record<string, string>>({})
  const groups = ref<SelectOption[]>([])

  async function loadGroups(centerId: number): Promise<void> {
    const list = await optionalRequest(fetchAllGroups(centerId), [])
    groups.value = list.map((g) => ({ label: g.name, value: g.id }))
  }

  // Center drives the group options; changing it (after init) clears the picks.
  watch(
    () => form.centerId,
    async (id, old) => {
      if (id === old) return
      if (typeof id === 'number') {
        if (old != null) form.groupIds = []
        await loadGroups(id)
      } else {
        groups.value = []
      }
    },
  )

  function clearErrors(): void {
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  function reset(editing: Lead | null): void {
    clearErrors()
    Object.assign(form, blankState(defaultCenterId()))
    if (!editing) return

    form.firstName = editing.firstName ?? ''
    form.lastName = editing.lastName ?? ''
    form.phone = editing.phone ?? ''
    form.secondPhone = editing.secondPhone ?? ''
    form.birthDate = parseDate(editing.birthDate)
    form.monthlyFee = editing.monthlyFee ?? ''
    form.heardAboutUs = editing.heardAboutUs ?? ''
    form.preferredTime = editing.preferredTime ?? null
    form.preferredDays = [...(editing.preferredDays ?? [])]
    form.centerId = editing.centerId ?? defaultCenterId()
    form.groupIds = [...(editing.groupIds ?? [])]
    form.passportSeries = editing.passportSeries ?? ''
    form.passportNumber = editing.passportNumber ?? ''
    form.jshshir = editing.jshshir ?? ''
    form.discountPercent = editing.discountPercent ?? ''
    form.discountReason = editing.discountReason ?? ''
    form.comment = editing.comment ?? ''
    form.followUpDate = parseDate(editing.followUpDate)
  }

  function validate(): boolean {
    clearErrors()
    if (!form.phone.trim()) errors.phone = t('leads.validation.phone')
    return Object.keys(errors).length === 0
  }

  function num(value: string | number): number | undefined {
    if (value === '' || value === null) return undefined
    const n = Number(value)
    return Number.isNaN(n) ? undefined : n
  }

  function toPayload(): LeadForm {
    const payload: LeadForm = { phone: form.phone.trim() }
    if (form.firstName.trim()) payload.firstName = form.firstName.trim()
    if (form.lastName.trim()) payload.lastName = form.lastName.trim()
    if (form.secondPhone.trim()) payload.secondPhone = form.secondPhone.trim()
    const birth = toDateString(form.birthDate)
    if (birth) payload.birthDate = birth
    if (form.comment.trim()) payload.comment = form.comment.trim()
    if (form.heardAboutUs.trim()) payload.heardAboutUs = form.heardAboutUs.trim()
    if (form.preferredTime) payload.preferredTime = form.preferredTime
    if (form.preferredDays.length) payload.preferredDays = [...form.preferredDays]
    if (form.centerId != null) payload.centerId = form.centerId
    if (form.groupIds.length) payload.groupIds = [...form.groupIds]
    const fee = num(form.monthlyFee)
    if (fee !== undefined) payload.monthlyFee = fee
    const percent = num(form.discountPercent)
    if (percent !== undefined) payload.discountPercent = percent
    if (form.discountReason.trim()) payload.discountReason = form.discountReason.trim()
    const followUp = toDateString(form.followUpDate)
    if (followUp) payload.followUpDate = followUp

    // Identity: passport and jshshir are mutually exclusive.
    if (form.jshshir.trim()) {
      payload.jshshir = form.jshshir.trim()
    } else {
      if (form.passportSeries.trim()) payload.passportSeries = form.passportSeries.trim()
      if (form.passportNumber.trim()) payload.passportNumber = form.passportNumber.trim()
    }
    return payload
  }

  /** Map the current form onto the transfer-to-student body (no followUpDate). */
  function toTransferPayload(): LeadTransferForm {
    const { followUpDate: _omit, ...base } = toPayload()
    return {
      ...base,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      status: LeadStatus.NEW,
      groupIds: form.groupIds.length ? [...form.groupIds] : [],
      // The lead form only carries a flat discount, so no periods are created
      // (mirrors old cabinet_front, which always sent an empty array).
      discountPeriods: [],
    }
  }

  function setBackendErrors(error: unknown): void {
    Object.assign(errors, mapBackendErrors(error))
  }

  return { form, errors, groups, reset, validate, toPayload, toTransferPayload, setBackendErrors }
}
