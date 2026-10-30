<template>
  <UiModal :model-value="!!member" :title="t('groups.formerStudents.payTitle', { name })" size="md" :close-on-overlay="!loading" @update:model-value="!$event && emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">{{ t('groups.formerStudents.payHint', { group: groupName }) }}</p>
      <UiMoneyInput
        :model-value="amount ?? ''"
        :label="t('students.view.modal.amount')"
        :hint="`${t('groups.formerStudents.toCollect')}: ${formatSom(member?.debt ?? 0)}`"
        :disabled="loading"
        @update:model-value="amount = $event === '' ? null : Number($event)"
      />
      <ReceptionFields v-model:method="reception.method.value" v-model:paid-at="reception.paidAt.value" v-model:comment="reception.comment.value" :disabled="loading" />
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" :disabled="!valid" @click="submit">{{ t('students.view.modal.pay') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiMoneyInput, UiButton } from '@/shared/components'
import ReceptionFields from '@/shared/components/receipt/ReceptionFields.vue'
import { useReceptionForm } from '@/shared/composables/use-reception-form'
import { payStudentDebt } from '@/modules/students/api/student-card.api'
import { useNotificationStore } from '@/stores/notification.store'
import { formatSom } from '@/shared/utils/format-money'
import type { GroupMember } from '../../interfaces/group-member.interface'

const { t } = useI18n()
const notify = useNotificationStore()

/** Takes a payment for THIS group's debt only (`groupId`), e.g. a transferred-out student. */
const props = defineProps<{ member: GroupMember | null; groupId: number; groupName: string }>()
const emit = defineEmits<{ close: []; paid: [] }>()

const amount = ref<number | null>(null)
const loading = ref(false)
const reception = useReceptionForm(() => !!props.member)
const name = computed(() => (props.member ? `${props.member.lastName} ${props.member.firstName}` : ''))
/** Never more than what is left to collect — the rest would have nowhere to go. */
const valid = computed(() => !!amount.value && amount.value > 0 && amount.value <= (props.member?.debt ?? 0))

watch(() => props.member, (m) => { amount.value = m?.debt || null })

async function submit(): Promise<void> {
  if (!props.member || !valid.value) return
  loading.value = true
  try {
    await payStudentDebt(props.member.studentId, { amount: amount.value!, ...reception.toForm(), groupId: props.groupId })
    notify.success(t('students.view.messages.paySuccess'))
    emit('paid')
  } catch {
    // Toasted by the interceptor; the modal stays open for a retry.
  } finally {
    loading.value = false
  }
}
</script>
