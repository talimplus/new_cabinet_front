<template>
  <div class="flex flex-wrap items-center gap-4">
    <div v-for="g in rows" :key="g.id" class="flex items-center gap-2">
      <div class="text-right">
        <p class="text-xs text-muted-foreground">
          {{ g.name }} ·
          {{ t(g.personal ? 'students.personalFee.personal' : 'students.personalFee.group') }}
        </p>
        <p class="font-mono text-lg font-semibold text-foreground">{{ formatSom(g.amount) }}</p>
      </div>
      <UiIconButton
        v-if="g.personal && canSetPersonalFee"
        :icon="ArrowLeftRight"
        :label="t('students.personalFee.action')"
        @click="student && dialogRef?.open(student.id, g.id)"
      />
    </div>
    <StudentPersonalFeeDialog ref="dialogRef" @done="emit('changed')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIconButton } from '@/shared/components'
import { ArrowLeftRight } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { formatSom } from '@/shared/utils/format-money'
import StudentPersonalFeeDialog from './StudentPersonalFeeDialog.vue'
import type { StudentSummaryProfile } from '../../interfaces/student-summary.interface'

const { t } = useI18n()

const props = defineProps<{ student: StudentSummaryProfile | null }>()
const emit = defineEmits<{ changed: [] }>()

const { canSetPersonalFee } = usePermissions()
const dialogRef = ref<InstanceType<typeof StudentPersonalFeeDialog> | null>(null)

/**
 * The monthly price per group: the student's personal price in that group
 * (> 0) wins, otherwise the group's current price. Each group has its own —
 * one price is never applied to every group.
 */
const rows = computed(() =>
  (props.student?.groups ?? []).map((g) => {
    const personal = Number(g.personalFee ?? 0) > 0
    return {
      id: g.id,
      name: g.name,
      personal,
      amount: personal ? Number(g.personalFee) : Number(g.monthlyFee ?? 0),
    }
  }),
)
</script>
