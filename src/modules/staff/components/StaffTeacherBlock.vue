<template>
  <!-- A teacher: this month's expected salary (for sizing an advance), then their groups. -->
  <SalaryForecastCard :user-id="userId" :month="month" />
  <StaffGroupsCard :groups="groups" />
</template>

<script setup lang="ts">
import SalaryForecastCard from '@/shared/components/staff-extras/SalaryForecastCard.vue'
import StaffGroupsCard from './StaffGroupsCard.vue'
import type { StaffTeacherGroup } from '../interfaces/staff-overview.interface'

defineProps<{ userId: number; /** "YYYY-MM". */ month: string; groups: StaffTeacherGroup[] }>()
</script>
