<template>
  <section class="space-y-3">
    <div>
      <h2 class="text-base font-bold text-foreground">{{ t('statistics.money.title') }}</h2>
      <p class="text-xs text-muted-foreground">{{ t('statistics.money.subtitle') }}</p>
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UiStatTile
        :label="t('statistics.money.income')"
        :value="formatSom(data?.income.amount ?? 0)"
        :hint="t('statistics.money.incomeHint', { count: data?.income.count ?? 0 })"
        :icon="HandCoins"
        tone="success"
        :to="detailLink(StatsDetailKind.INCOME, query)"
      >
        <RouterLink
          v-if="data && data.pending.amount > 0"
          :to="detailLink(StatsDetailKind.INCOME, query, { status: StatsIncomeStatus.PENDING })"
          class="mt-2 rounded-md bg-warning-soft px-2 py-1 text-xs text-warning hover:underline"
        >
          {{ t('statistics.money.pending', { amount: formatSom(data.pending.amount), count: data.pending.count }) }}
        </RouterLink>
      </UiStatTile>
      <UiStatTile
        :label="t('statistics.money.expenses')"
        :value="formatSom(data?.expenses.amount ?? 0)"
        :hint="t('statistics.money.expensesHint', { count: data?.expenses.count ?? 0 })"
        :icon="ReceiptText"
        tone="danger"
        :to="detailLink(StatsDetailKind.EXPENSES, query)"
      />
      <UiStatTile
        :label="t('statistics.money.salaries')"
        :value="formatSom(data?.salaries.amount ?? 0)"
        :hint="salaryHint"
        :icon="Wallet"
        tone="warning"
        :to="detailLink(StatsDetailKind.SALARIES, query)"
      />
      <UiStatTile
        :label="t(net >= 0 ? 'statistics.money.left' : 'statistics.money.loss')"
        :value="formatSom(Math.abs(net))"
        :value-class="net >= 0 ? 'text-success' : 'text-danger'"
        :hint="t('statistics.money.leftHint')"
        :icon="net >= 0 ? TrendingUp : TrendingDown"
        :tone="net >= 0 ? 'success' : 'danger'"
      >
        <p v-if="data && data.refunds.amount > 0" class="mt-1 text-xs text-muted-foreground">
          {{ t('statistics.money.refunds', { amount: formatSom(data.refunds.amount) }) }}
        </p>
      </UiStatTile>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UiStatTile } from '@/shared/components'
import { HandCoins, ReceiptText, Wallet, TrendingUp, TrendingDown } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { StatsDetailKind } from '../enums/stats-detail-kind.enum'
import { StatsIncomeStatus } from '../enums/stats-income-status.enum'
import { detailLink } from '../composables/use-detail-link'
import type { StatsOverviewResponse } from '../interfaces/stats-overview.interface'

const { t } = useI18n()
const props = defineProps<{ data: StatsOverviewResponse | null; query: Record<string, string> }>()

const net = computed(() => props.data?.balance ?? 0)
const salaryHint = computed(() => {
  const s = props.data?.salaries
  return s && s.advanceAmount > 0
    ? t('statistics.money.salariesWithAdvance', { advance: formatSom(s.advanceAmount) })
    : t('statistics.money.salariesHint')
})
</script>
