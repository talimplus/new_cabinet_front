<template>
  <div class="flex flex-wrap gap-2">
    <UiButton size="sm" variant="outline" @click="open(StaffExtraKind.ADVANCE)">
      <UiIcon :icon="HandCoins" :size="16" />{{ t('payroll.extras.advanceTitle') }}
    </UiButton>
    <UiButton size="sm" variant="outline" @click="open(StaffExtraKind.BONUS)">
      <UiIcon :icon="Gift" :size="16" />{{ t('payroll.extras.bonusTitle') }}
    </UiButton>
    <StaffExtraDialog ref="dialogRef" @saved="emit('saved')" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon } from '@/shared/components'
import { Gift, HandCoins } from '@/shared/icons'
import StaffExtraDialog from '@/shared/components/staff-extras/StaffExtraDialog.vue'
import { StaffExtraKind } from '@/shared/enums/staff-extra-kind.enum'

const { t } = useI18n()

/** Advance / bonus for this employee — works even before the month has a salary row. */
const props = defineProps<{ userId: number; name: string; month?: string }>()
const emit = defineEmits<{ saved: [] }>()

const dialogRef = ref<InstanceType<typeof StaffExtraDialog> | null>(null)
const open = (kind: StaffExtraKind) =>
  dialogRef.value?.open(kind, { userId: props.userId, name: props.name, month: props.month })
</script>
