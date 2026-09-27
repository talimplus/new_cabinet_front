<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <UiIconButton :icon="ArrowLeft" :label="t('common.back')" @click="router.back()" />
      <h1 class="text-lg font-bold text-foreground">
        {{ group?.name ?? t('layout.titles.group') }}
      </h1>
    </div>

    <UiTabs :tabs="tabs" :model-value="activeTab" @update:model-value="activeTab = $event as GroupTab" />

    <div v-if="loading" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <template v-else>
      <GroupAttendanceTab
        v-if="activeTab === GroupTab.ATTENDANCE"
        :group-id="groupId"
        :students="students"
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
      <template v-else>
        <GroupInfoTab :group="group" :student-count="students.length" />
        <GroupPausesCard :group-id="groupId" :can-edit="canEditGroup" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiSpinner, UiIconButton, UiTabs } from '@/shared/components'
import { ArrowLeft } from '@/shared/icons'
import GroupAttendanceTab from '../components/detail/GroupAttendanceTab.vue'
import GroupStudentsTab from '../components/detail/GroupStudentsTab.vue'
import GroupInfoTab from '../components/detail/GroupInfoTab.vue'
import GroupPausesCard from '../components/detail/GroupPausesCard.vue'
import { usePermissions } from '@/shared/composables/use-permissions'
import GroupPlanTab from '../components/plan/GroupPlanTab.vue'
import { useGroupDetail } from '../composables/use-group-detail'
import { GroupTab } from '../enums/group-tab.enum'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const groupId = Number(route.params.id)

const { group, students, loading, loadingStudents, activeTab, tabs, canEditPlan, canTransfer, load } =
  useGroupDetail(groupId)

const { canEditGroup } = usePermissions()

onMounted(load)
</script>
