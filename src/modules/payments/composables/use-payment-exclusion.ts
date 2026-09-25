import { computed, ref, watch } from 'vue'
import { previewExclusion } from '../api/payments.api'
import { debounce } from '@/shared/utils/debounce'
import type { Payment } from '../interfaces/payment.interface'
import type {
  ExclusionForm,
  ExclusionPreviewResponse,
  ExclusionState,
} from '../interfaces/payment-exclusion.interface'

export type ExclusionMode = 'lessons' | 'amount'

/**
 * State behind `PaymentExclusionCard`: pick lessons or a sum to write off, watch
 * the recomputed total live (PUT preview-exclusion, debounced), and hand the
 * dialog a ready `apply-exclusion` body. Nothing is stored until the dialog
 * applies it.
 */
export function usePaymentExclusion(payment: () => Payment | null) {
  const mode = ref<ExclusionMode | null>(null)
  const lessons = ref<number | null>(null)
  const amount = ref<number | null>(null)
  const comment = ref('')
  const preview = ref<ExclusionPreviewResponse | null>(null)
  const previewing = ref(false)

  /** A write-off is only "entered" once the value for the chosen mode is > 0. */
  const active = computed(() =>
    mode.value === 'lessons' ? (lessons.value ?? 0) > 0 : (amount.value ?? 0) > 0,
  )
  const valid = computed(() => !active.value || comment.value.trim().length > 0)

  const form = computed<ExclusionForm | null>(() => {
    if (!active.value) return null
    const body = comment.value.trim()
    return mode.value === 'lessons'
      ? { excludeLessons: lessons.value ?? 0, comment: body }
      : { excludeAmount: amount.value ?? 0, comment: body }
  })

  const state = computed<ExclusionState>(() => ({
    active: active.value,
    form: form.value,
    preview: preview.value,
    valid: valid.value,
    previewing: previewing.value,
  }))

  function reset(): void {
    mode.value = null
    lessons.value = null
    amount.value = null
    comment.value = ''
    preview.value = null
    previewing.value = false
  }

  /** Switching mode clears the other field so only one write-off is ever sent. */
  function setMode(value: ExclusionMode | null): void {
    mode.value = value
    lessons.value = null
    amount.value = null
    preview.value = null
    if (!value) comment.value = ''
  }

  const runPreview = debounce(async () => {
    const row = payment()
    if (!row || !active.value) return
    try {
      preview.value = await previewExclusion(
        row.id,
        mode.value === 'lessons'
          ? { excludeLessons: lessons.value ?? 0 }
          : { excludeAmount: amount.value ?? 0 },
      )
    } catch {
      // The http interceptor already toasted — just drop the stale total.
      preview.value = null
    } finally {
      previewing.value = false
    }
  })

  // Any change to the entered write-off re-runs the live calculation. The
  // `previewing` flag flips immediately so the dialog can block confirming
  // while a stale total is on screen.
  watch([mode, lessons, amount], () => {
    if (!active.value) {
      preview.value = null
      previewing.value = false
      return
    }
    previewing.value = true
    runPreview()
  })

  return { mode, lessons, amount, comment, preview, previewing, active, valid, state, setMode, reset }
}
