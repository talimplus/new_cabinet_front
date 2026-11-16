<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div class="min-w-0">
        <h2 class="text-base font-bold text-foreground">{{ t('statistics.trend.title') }}</h2>
        <p class="text-xs text-muted-foreground">{{ t('statistics.trend.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <UiSpinner v-if="trend.loading.value" :size="16" class="text-muted-foreground" />
        <div class="flex rounded-md border border-border bg-surface p-0.5" role="group">
          <button
            v-for="m in options"
            :key="m"
            type="button"
            :aria-pressed="trend.state.trend === m"
            :class="cn('h-10 rounded-sm px-3 text-sm font-semibold md:h-8', trend.state.trend === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')"
            @click="trend.setMonths(m)"
          >
            {{ t(m === TrendMonths.YEAR ? 'statistics.trend.year' : 'statistics.trend.halfYear') }}
          </button>
        </div>
      </div>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <StatsTrendCard
        :title="t('statistics.trend.moneyTitle')"
        :hint="t('statistics.trend.moneyHint')"
        :categories="c.moneyCategories.value"
        :series="c.moneySeries.value"
        :format="formatSom"
        :change="c.incomeChange.value"
      />
      <StatsTrendCard
        :title="t('statistics.trend.studentsTitle')"
        :hint="t('statistics.trend.studentsHint')"
        :categories="c.categories.value"
        :series="c.studentSeries.value"
        :format="(v: number) => t('statistics.trend.count', { count: v })"
        :change="c.studentsChange.value"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSpinner } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { TrendMonths } from '../enums/trend-months.enum'
import { useStatsTrend } from '../composables/use-stats-trend'
import { useTrendCharts } from '../composables/use-trend-charts'
import StatsTrendCard from './StatsTrendCard.vue'

const { t } = useI18n()
const trend = useStatsTrend()
const c = useTrendCharts(trend.points)
const options = [TrendMonths.HALF_YEAR, TrendMonths.YEAR]
onMounted(trend.load)
</script>
