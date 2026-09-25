import { computed, watch, type ComputedRef, type Ref } from 'vue'
import { useField, type RuleExpression } from 'vee-validate'

/**
 * Props every form control shares. A control is usable in two modes:
 *  - **Plain**: bound with `v-model`; errors passed via the `error` prop.
 *  - **Validated**: given a `name` (and optional `rules`), it registers itself
 *    with the surrounding vee-validate `<UiForm>` — no `<Field>` wrapper needed.
 *    Backend errors mapped through the form's `setErrors({ name: [...] })` land
 *    on the matching control automatically.
 */
export interface FormControlProps<T> {
  modelValue?: T
  name?: string
  rules?: RuleExpression<T>
  label?: string
  error?: string
}

export interface FormControl<T> {
  /** The value to bind to the underlying element (`v-model`). */
  model: Ref<T>
  /** Resolved error message (explicit `error` prop wins over validation). */
  errorMessage: ComputedRef<string | undefined>
  /** Call on blur so vee-validate can run on-blur validation. */
  handleBlur: (e?: Event) => void
}

/**
 * Wire a control to vee-validate when `name` is present, otherwise fall back to
 * a plain `v-model` bridge. `name` is treated as static per component instance.
 */
export function useFormControl<T>(
  props: FormControlProps<T>,
  emit: (event: 'update:modelValue', value: T) => void,
): FormControl<T> {
  if (props.name) {
    const { value, errorMessage, handleBlur } = useField<T>(
      () => props.name as string,
      props.rules,
      { initialValue: props.modelValue as T, label: () => props.label, syncVModel: false },
    )

    // Keep the external v-model and the vee-validate field in sync both ways.
    watch(value, (v) => emit('update:modelValue', v))
    watch(
      () => props.modelValue,
      (v) => {
        if (v !== value.value) value.value = v as T
      },
    )

    return {
      model: value,
      errorMessage: computed(() => props.error ?? errorMessage.value),
      handleBlur,
    }
  }

  const model = computed<T>({
    get: () => props.modelValue as T,
    set: (v) => emit('update:modelValue', v),
  })

  return {
    model,
    errorMessage: computed(() => props.error),
    handleBlur: () => {},
  }
}
