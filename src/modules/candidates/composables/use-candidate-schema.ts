import { computed } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { t } from '@/locales'
import type { CandidateForm } from '../interfaces/candidate-form.interface'
import { CandidatePosition, POSITIONS_WITH_SUBJECT } from '../enums/candidate-position.enum'

export const MIN_BIRTH_YEAR = 1940

const textOrNull = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s || null
}

/** Validated form values → request body. Empty optional fields become `null`
 *  so an edit can clear them. */
export function toCandidateForm(values: GenericObject): CandidateForm {
  return {
    centerId: values.centerId as number,
    lastName: String(values.lastName).trim(),
    firstName: String(values.firstName).trim(),
    phone: values.phone as string,
    experience: String(values.experience).trim(),
    birthYear: values.birthYear as number,
    position: values.position as CandidatePosition,
    // Admin / manager / ... have no subject — a value left over from a switch is dropped.
    subjectId: POSITIONS_WITH_SUBJECT.includes(values.position as CandidatePosition)
      ? ((values.subjectId as number | null | undefined) ?? null)
      : null,
    address: textOrNull(values.address),
    comment: textOrNull(values.comment),
  }
}

/** Validation for the candidate form — rebuilt on language change. */
export function useCandidateSchema() {
  return computed(() => {
    const maxYear = new Date().getFullYear()
    return toTypedSchema(
      z.object({
        centerId: z.number({ message: t('common.centerRequired') }),
        lastName: z.string().trim().min(1, t('candidates.validation.lastName')),
        firstName: z.string().trim().min(1, t('candidates.validation.firstName')),
        phone: z.string().regex(/^\+998\d{9}$/, t('candidates.validation.phone')),
        experience: z.string().trim().min(1, t('candidates.validation.experience')),
        birthYear: z
          .number({ message: t('candidates.validation.birthYear') })
          .int(t('candidates.validation.birthYear'))
          .min(MIN_BIRTH_YEAR, t('candidates.validation.birthYearRange', { min: MIN_BIRTH_YEAR, max: maxYear }))
          .max(maxYear, t('candidates.validation.birthYearRange', { min: MIN_BIRTH_YEAR, max: maxYear })),
        position: z.nativeEnum(CandidatePosition, { message: t('candidates.validation.position') }),
        subjectId: z.number().nullable().optional(),
        address: z.string().optional(),
        comment: z.string().optional(),
      }).refine((v) => v.position !== CandidatePosition.TEACHER || v.subjectId != null, {
        message: t('candidates.validation.subject'),
        path: ['subjectId'],
      }),
    )
  })
}
