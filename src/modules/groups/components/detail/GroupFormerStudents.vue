<template>
  <section v-if="former.length" class="space-y-2">
    <h4 class="text-sm font-semibold text-foreground">
      {{ t('groups.formerStudents.title', { count: former.length }) }}
    </h4>
    <p class="text-xs text-muted-foreground">{{ t('groups.formerStudents.hint') }}</p>
    <ul class="divide-y divide-border rounded-md border border-border text-sm">
      <li v-for="m in former" :key="m.studentId" class="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
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
        <GroupMemberMoney v-if="m.debt != null" :member="m" :can-pay="canTakePayment" @pay="paying = m" />
      </li>
    </ul>
    <GroupMemberPayModal :member="paying" :group-id="groupId" :group-name="groupName" @close="paying = null" @paid="onPaid" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { fetchGroupMembers } from '../../api/groups.api'
import { usePermissions } from '@/shared/composables/use-permissions'
import { formatDate } from '@/shared/utils/format-date'
import GroupMemberMoney from './GroupMemberMoney.vue'
import GroupMemberPayModal from './GroupMemberPayModal.vue'
import type { GroupMember } from '../../interfaces/group-member.interface'

const { t } = useI18n()
const { canTakePayment } = usePermissions()

/** The parent re-keys this on a transfer, so it reloads with the list. */
const props = defineProps<{ groupId: number; groupName: string }>()

const members = ref<GroupMember[]>([])
const paying = ref<GroupMember | null>(null)
/** Left the group (transferred, stopped) — their marks stay in the journal. */
const former = computed(() => members.value.filter((m) => !m.isCurrent && m.leftAt))

async function load(): Promise<void> {
  try {
    members.value = await fetchGroupMembers(props.groupId)
  } catch {
    members.value = []
  }
}
function onPaid(): void {
  paying.value = null
  void load()
}
onMounted(load)
</script>
