<template>
  <div class="space-y-6">
    <DateRangeFilter
      :range="o.period.range"
      :preset="o.period.preset.value"
      :label="o.period.label.value"
      @preset="o.period.setPreset"
      @range="o.period.set"
    />
    <StatsSummary :lines="s.lines.value" :level="s.level.value" :label="o.period.label.value" :loading="o.loading.value" />
    <StatsMoneySection :data="o.data.value" :query="o.period.query.value" />
    <StatsBillingCard :data="o.data.value" :query="o.period.query.value" />
    <StatsStudentsSection :data="o.data.value" :query="o.period.query.value" />
    <StatsTrendSection />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStatsOverview } from '../composables/use-stats-overview'
import { useStatsSummary } from '../composables/use-stats-summary'
import DateRangeFilter from '../components/DateRangeFilter.vue'
import StatsSummary from '../components/StatsSummary.vue'
import StatsMoneySection from '../components/StatsMoneySection.vue'
import StatsBillingCard from '../components/StatsBillingCard.vue'
import StatsStudentsSection from '../components/StatsStudentsSection.vue'
import StatsTrendSection from '../components/StatsTrendSection.vue'

const o = useStatsOverview()
const s = useStatsSummary(o.data)
onMounted(o.load)
</script>
