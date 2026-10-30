<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <UiBackButton :fallback="{ name: 'groups' }" />
      <h1 class="text-lg font-bold text-foreground">
        {{ group?.name ?? t('layout.titles.group') }}
      </h1>
      <UiButton v-if="canFinish" variant="outline" size="sm" class="ml-auto" @click="group && finishRef?.open(group)">
        <UiIcon :icon="Flag" :size="16" />{{ t('groups.finish.action') }}
      </UiButton>
    </div>
    <GroupFinishDialog ref="finishRef" @done="load" />

    <UiTabs :tabs="tabs" :model-value="activeTab" @update:model-value="activeTab = $event as GroupTab" />

    <div v-if="loading" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <template v-else>
      <GroupAttendanceTab
        v-if="activeTab === GroupTab.ATTENDANCE"
        :group-id="groupId"
        :students="students"
        :finished="group?.status === GroupStatus.FINISHED"
        :end-date="group?.endDate"
      />
      <GroupPlanTab
        v-else-if="activeTab === GroupTab.PLAN"
        :group-id="groupId"
        :center-id="group?.center?.id"
        :subject-id="group?.subject?.id"
        :can-edit="canEditPlan"
      />
      <GroupStudentsTab
        v-else-if="activeTab === GroupTab.STUDENTS"
        :students="students"
        :loading="loadingStudents"
        :group-id="groupId"
        :group-name="group?.name ?? ''"
        :can-transfer="canTransfer"
        @reload="load"
      />
      <GroupTimelineTab v-else-if="activeTab === GroupTab.TIMELINE" :group-id="groupId" />
      <template v-else>
        <GroupInfoTab :group="group" :student-count="students.length" />
        <GroupPausesCard :group-id="groupId" :can-edit="canEditGroup" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UiSpinner, UiBackButton, UiTabs, UiButton, UiIcon } from '@/shared/components'
import { Flag } from '@/shared/icons'
import GroupFinishDialog from '../components/GroupFinishDialog.vue'
import { GroupStatus } from '../enums/group-status.enum'
import GroupAttendanceTab from '../components/detail/GroupAttendanceTab.vue'
import GroupStudentsTab from '../components/detail/GroupStudentsTab.vue'
import GroupInfoTab from '../components/detail/GroupInfoTab.vue'
import GroupPausesCard from '../components/detail/GroupPausesCard.vue'
import GroupTimelineTab from '../components/detail/GroupTimelineTab.vue'
import { usePermissions } from '@/shared/composables/use-permissions'
import GroupPlanTab from '../components/plan/GroupPlanTab.vue'
import { useGroupDetail } from '../composables/use-group-detail'
import { GroupTab } from '../enums/group-tab.enum'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const groupId = Number(route.params.id)

const { group, students, loading, loadingStudents, activeTab, tabs, canEditPlan, canTransfer, load } =
  useGroupDetail(groupId)

const { canEditGroup, canChangeGroupStatus } = usePermissions()
const finishRef = ref<InstanceType<typeof GroupFinishDialog> | null>(null)
/** Only a running group is finished (a NEW one is started or deleted instead). */
const canFinish = computed(() => canChangeGroupStatus.value && group.value?.status === GroupStatus.STARTED)

onMounted(load)
</script>
