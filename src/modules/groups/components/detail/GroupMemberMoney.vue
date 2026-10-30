<template>
  <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 text-right">
    <div class="font-mono text-xs">
      <div v-if="debt > 0" class="font-semibold text-danger">{{ t('groups.formerStudents.debt', { amount: formatSom(debt) }) }}</div>
      <div v-else class="text-muted-foreground">{{ t('groups.formerStudents.noDebt') }}</div>
      <!-- Reception took it, the admin has not confirmed yet: not the student's debt. -->
      <div v-if="pending > 0" class="text-warning">{{ t('groups.formerStudents.pending', { amount: formatSom(pending) }) }}</div>
    </div>
    <UiButton v-if="canPay && debt > 0" size="sm" variant="outline" @click="emit('pay')">
      {{ t('groups.formerStudents.pay') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { GroupMember } from '../../interfaces/group-member.interface'

const { t } = useI18n()

const props = defineProps<{ member: GroupMember; canPay?: boolean }>()
const emit = defineEmits<{ pay: [] }>()

const debt = computed(() => props.member.debt ?? 0)
const pending = computed(() => props.member.pending ?? 0)
</script>
