<template>
  <section v-if="former.length" class="space-y-2">
    <h4 class="text-sm font-semibold text-foreground">
      {{ t('groups.formerStudents.title', { count: former.length }) }}
    </h4>
    <p class="text-xs text-muted-foreground">{{ t('groups.formerStudents.hint') }}</p>
    <ul class="divide-y divide-border rounded-md border border-border text-sm">
      <li v-for="m in former" :key="m.studentId" class="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <RouterLink :to="{ name: 'student-card', params: { id: m.studentId } }" class="font-medium text-primary hover:underline">
            {{ m.lastName }} {{ m.firstName }}
          </RouterLink>
          <p class="text-xs text-muted-foreground">
            <span class="font-mono">{{ formatDate(m.joinedAt) }} – {{ formatDate(m.leftAt) }}</span>
            <span v-if="m.transferredToGroupName"> · {{ t('groups.formerStudents.transferredTo', { name: m.transferredToGroupName }) }}</span>
            <span v-else-if="m.leftReason"> · {{ m.leftReason }}</span>
          </p>
        </div>
        <span v-if="m.debt != null" :class="m.debt > 0 ? 'font-mono font-semibold text-danger' : 'font-mono text-muted-foreground'">
          {{ m.debt > 0 ? t('groups.formerStudents.debt', { amount: formatSom(m.debt) }) : t('groups.formerStudents.noDebt') }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { fetchGroupMembers } from '../../api/groups.api'
import { formatDate } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import type { GroupMember } from '../../interfaces/group-member.interface'

const { t } = useI18n()

/** The parent re-keys this on a transfer, so it reloads with the list. */
const props = defineProps<{ groupId: number }>()

const members = ref<GroupMember[]>([])
/** Left the group (transferred, stopped) — their marks stay in the journal. */
const former = computed(() => members.value.filter((m) => !m.isCurrent && m.leftAt))

async function load(): Promise<void> {
  try {
    members.value = await fetchGroupMembers(props.groupId)
  } catch {
    members.value = []
  }
}
onMounted(load)
</script>
