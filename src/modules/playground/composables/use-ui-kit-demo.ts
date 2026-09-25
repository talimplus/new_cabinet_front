import { ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useNotificationStore } from '@/stores/notification.store'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/** State + handlers for the UI-kit showcase page (keeps the view thin). */
export function useUiKitDemo() {
  const notify = useNotificationStore()

  const modalOpen = ref(false)
  const subject = ref<number | null>(null)
  const birthDate = ref<Date | null>(null)
  const agree = ref(false)

  const subjects: SelectOption[] = [
    { label: 'Ingliz tili', value: 1 },
    { label: 'Matematika', value: 2 },
    { label: 'Fizika', value: 3 },
  ]

  const schema = toTypedSchema(
    z.object({
      fullName: z.string().min(1, 'Ism majburiy'),
      email: z.string().email('Email noto‘g‘ri'),
    }),
  )

  function onSubmit(values: Record<string, unknown>) {
    notify.success(`Saqlandi: ${JSON.stringify(values)}`)
  }

  return { notify, modalOpen, subject, birthDate, agree, subjects, schema, onSubmit }
}
