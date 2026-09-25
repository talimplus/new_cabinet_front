<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { UiButton, UiIcon, UiSpinner } from '@/shared/components'
import { HandCoins } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useScopeStore } from '@/stores/scope.store'
import { useStudentCard } from '../composables/use-student-card'
import { usePayDebt } from '../composables/use-pay-debt'
import { useStudentTransfer } from '@/shared/composables/use-student-transfer'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import StudentCardHeader from '../components/card/StudentCardHeader.vue'
import StudentInfoCard from '../components/card/StudentInfoCard.vue'
import StudentTelegramSection from '../components/card/StudentTelegramSection.vue'
import StudentStatsCards from '../components/card/StudentStatsCards.vue'
import StudentMonthsTable from '../components/card/StudentMonthsTable.vue'
import StudentCardModals from '../components/card/StudentCardModals.vue'
import type { StudentSummaryGroup } from '../interfaces/student-summary.interface'

const { t } = useI18n()
const route = useRoute()
const scope = useScopeStore()
const { canEditStudent, canTakePayment, canTransferStudents, canViewStudents } = usePermissions()

const studentId = computed(() => {
  const raw = route.params.id
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(id) && id > 0 ? id : null
})

const card = useStudentCard(() => studentId.value)
const pay = usePayDebt(() => studentId.value, () => card.months.value, () => card.payableNow.value)
const transfer = useStudentTransfer(
  () => (studentId.value ? [studentId.value] : []),
  () => card.load(),
  () => fetchAllGroups(),
)

onMounted(card.load)

/** The pay-debt response already carries the refreshed summary. */
async function onPay(): Promise<void> {
  const summary = await pay.submit()
  if (summary) card.apply(summary)
}

const openTransfer = (group: StudentSummaryGroup) => transfer.open(group.id, group.name)
const payable = computed(() => card.payableNow.value > 0)
</script>

<template>
  <div class="space-y-4">
    <div v-if="card.loading.value && !card.summary.value" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>

    <p v-else-if="!card.summary.value" class="rounded-lg bg-warning-soft p-4 text-sm text-warning">
      {{ t('students.view.notFound') }}
    </p>

    <template v-else>
      <StudentCardHeader
        :student="card.student.value"
        :can-edit="canEditStudent"
        :edit-loading="card.editLoading.value"
        @edit="card.openEdit"
      />

      <StudentInfoCard :student="card.student.value" :can-transfer="canTransferStudents" @transfer="openTransfer" />

      <StudentTelegramSection
        v-if="canViewStudents"
        :student-id="studentId"
        :student-name="card.fullName.value"
        :can-edit="canEditStudent"
      />

      <StudentStatsCards :totals="card.totals.value" />

      <div class="flex flex-wrap items-center justify-end gap-3">
        <span v-if="!payable" class="text-sm text-muted-foreground">{{ t('students.view.allSettled') }}</span>
        <UiButton v-if="canTakePayment" :disabled="!payable" @click="pay.openModal">
          <UiIcon :icon="HandCoins" :size="16" />{{ t('students.view.payDebt') }}
        </UiButton>
      </div>

      <StudentMonthsTable :months="card.months.value" :loading="card.loading.value" />
    </template>

    <StudentCardModals
      :card="card" :pay="pay" :transfer="transfer"
      :payable-now="card.payableNow.value"
      :default-center-id="scope.centerIdForCreate"
      @pay="onPay"
    />
  </div>
</template>
