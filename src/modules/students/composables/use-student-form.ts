import { reactive } from 'vue'
import { useStudentOptions } from './use-student-options'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { StudentPreferredTime } from '../enums/student-preferred-time.enum'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString, parseDate } from '@/shared/utils/format-date'
import type { Student } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import {
  applyDiscount,
  blankDiscount,
  discountFromStudent,
  type DiscountState,
} from '../utils/student-discount'
import { t } from '@/locales'


interface StudentFormState extends DiscountState {
  firstName: string
  lastName: string
  phone: string
  secondPhone: string
  birthDate: Date | null
  referrerId: number | null
  monthlyFee: string | number
  heardAboutUs: string
  preferredTime: StudentPreferredTime | null
  preferredDays: WeekDay[]
  centerId: number | null
  groupIds: number[]
  subjectId: number | null
  passportSeries: string
  passportNumber: string
  jshshir: string
  comment: string
}

function blankState(centerId: number | null): StudentFormState {
  return {
    firstName: '', lastName: '', phone: '', secondPhone: '', birthDate: null,
    referrerId: null, monthlyFee: '', heardAboutUs: '', preferredTime: null,
    preferredDays: [], centerId, groupIds: [], subjectId: null,
    passportSeries: '', passportNumber: '', jshshir: '', comment: '',
    ...blankDiscount(),
  }
}

/**
 * Student create/edit state. Owns the reactive form, the scoped select options
 * (reloaded on every open), validation and payload building. The
 * discount block toggles between a single discount (percent OR amount) and a
 * list of periods (each optionally limited to one group).
 */
export function useStudentForm(defaultCenterId: () => number | null) {
  const { subjects, groups, referrers, loadFor, clear } = useStudentOptions()

  const form = reactive<StudentFormState>(blankState(defaultCenterId()))
  const errors = reactive<Record<string, string>>({})

  function clearErrors(): void {
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  function reset(editing: Student | null): void {
    clearErrors()
    Object.assign(form, blankState(defaultCenterId()))
    if (editing) fillFrom(editing)
    loadOptions()
  }

  /**
   * Reloaded on every open, not on a centerId change: the center rarely differs
   * between opens (a watcher then never fires and the selects stay empty), and
   * a group or subject added since the last open must show up.
   */
  function loadOptions(): void {
    if (typeof form.centerId === 'number') void loadFor(form.centerId)
    else clear()
  }

  function fillFrom(editing: Student): void {

    form.firstName = editing.firstName ?? ''
    form.lastName = editing.lastName ?? ''
    form.phone = editing.phone ?? ''
    form.secondPhone = editing.secondPhone ?? ''
    form.birthDate = parseDate(editing.birthDate)
    form.referrerId = editing.referrerId ?? null
    form.monthlyFee = editing.monthlyFee ?? ''
    form.heardAboutUs = editing.heardAboutUs ?? ''
    form.preferredTime = editing.preferredTime ?? null
    form.preferredDays = [...(editing.preferredDays ?? [])]
    form.centerId = editing.centerId ?? defaultCenterId()
    form.groupIds = [...(editing.groupIds ?? [])]
    form.subjectId = editing.subjectId ?? null
    form.passportSeries = editing.passportSeries ?? ''
    form.passportNumber = editing.passportNumber ?? ''
    form.jshshir = editing.jshshir ?? ''
    form.comment = editing.comment ?? ''
    Object.assign(form, discountFromStudent(editing))
  }

  function validate(): boolean {
    clearErrors()
    if (!form.firstName.trim()) errors.firstName = t('students.validation.firstName')
    if (!form.lastName.trim()) errors.lastName = t('students.validation.lastName')
    if (!form.phone.trim()) errors.phone = t('students.validation.phone')
    return Object.keys(errors).length === 0
  }

  function num(value: string | number): number | undefined {
    if (value === '' || value === null) return undefined
    const n = Number(value)
    return Number.isNaN(n) ? undefined : n
  }

  function toPayload(): StudentForm {
    const payload: StudentForm = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
    }
    if (form.secondPhone.trim()) payload.secondPhone = form.secondPhone.trim()
    const birth = toDateString(form.birthDate)
    if (birth) payload.birthDate = birth
    if (form.comment.trim()) payload.comment = form.comment.trim()
    if (form.heardAboutUs.trim()) payload.heardAboutUs = form.heardAboutUs.trim()
    if (form.preferredTime) payload.preferredTime = form.preferredTime
    if (form.preferredDays.length) payload.preferredDays = [...form.preferredDays]
    if (form.referrerId != null) payload.referrerId = form.referrerId
    if (form.centerId != null) payload.centerId = form.centerId
    if (form.subjectId != null) payload.subjectId = form.subjectId
    if (form.groupIds.length) payload.groupIds = [...form.groupIds]
    const fee = num(form.monthlyFee)
    if (fee !== undefined) payload.monthlyFee = fee

    // Identity: passport and jshshir are mutually exclusive.
    if (form.jshshir.trim()) {
      payload.jshshir = form.jshshir.trim()
    } else {
      if (form.passportSeries.trim()) payload.passportSeries = form.passportSeries.trim()
      if (form.passportNumber.trim()) payload.passportNumber = form.passportNumber.trim()
    }

    applyDiscount(form, payload)
    return payload
  }

  function setBackendErrors(error: unknown): void {
    Object.assign(errors, mapBackendErrors(error))
  }

  return {
    form, errors, subjects, groups, referrers,
    reset, validate, toPayload, setBackendErrors,
  }
}
