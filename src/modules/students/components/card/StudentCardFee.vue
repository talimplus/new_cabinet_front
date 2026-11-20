<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="text-right">
      <p class="text-xs text-muted-foreground">
        {{ t('students.view.card.monthlyFee') }} ·
        {{ t(personal ? 'students.personalFee.personal' : 'students.personalFee.group') }}
      </p>
      <p class="font-mono text-lg font-semibold text-foreground">{{ formatSom(amount) }}</p>
    </div>
    <UiButton v-if="personal && canSetPersonalFee" variant="outline" @click="student && dialogRef?.open(student.id)">
      <UiIcon :icon="ArrowLeftRight" :size="16" />
      {{ t('students.personalFee.action') }}
    </UiButton>
    <StudentPersonalFeeDialog ref="dialogRef" @done="emit('changed')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon } from '@/shared/components'
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

/** A personal price (> 0) wins; otherwise the student pays the groups' current prices. */
const personal = computed(() => Number(props.student?.monthlyFee ?? 0) > 0)
const amount = computed(() =>
  personal.value
    ? Number(props.student?.monthlyFee ?? 0)
    : (props.student?.groups ?? []).reduce((sum, g) => sum + Number(g.monthlyFee ?? 0), 0),
)
</script>
