<template>
  <div>
    <span class="whitespace-nowrap font-mono font-semibold">{{ formatSom(getCalculated(staff)) }}</span>
    <!-- How it adds up: "maosh 0 + ustama 862 346 − 135 000 noyabrga o'tdi". -->
    <div v-if="note" class="mt-0.5 text-xs text-muted-foreground md:max-w-[16rem] md:whitespace-normal">
      {{ note }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatSom } from '@/shared/utils/format-money'
import { calculatedNote, getCalculated } from '../utils/payroll-salary'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const props = defineProps<{ staff: StaffSalary }>()
const note = computed(() => calculatedNote(props.staff))
</script>
