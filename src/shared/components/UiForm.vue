<template>
  <form novalidate @submit.prevent="onSubmit">
    <slot :values="values" :is-submitting="isSubmitting" :errors="errors" />
  </form>
</template>

<script setup lang="ts">
import { useForm, type GenericObject, type TypedSchema } from 'vee-validate'
import { mapBackendErrors } from '@/shared/utils/backend-errors'

interface Props {
  initialValues?: GenericObject
  validationSchema?: TypedSchema | Record<string, unknown>
}

const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: GenericObject] }>()

const { handleSubmit, setErrors, setFieldError, resetForm, validate, values, errors, isSubmitting } =
  useForm({
    initialValues: props.initialValues,
    validationSchema: props.validationSchema,
  })

const onSubmit = handleSubmit((formValues) => {
  emit('submit', formValues)
})

/** Map a failed API response onto the matching fields (see docs §2.3). */
function setBackendErrors(error: unknown): void {
  setErrors(mapBackendErrors(error))
}

// Exposed so parent views can submit programmatically, reset, seed errors,
// validate, or map backend failures.
defineExpose({ submit: onSubmit, setErrors, setFieldError, setBackendErrors, resetForm, validate, values, errors })
</script>
