<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('roles.form.permissions') }}
        <span class="font-mono text-xs font-normal text-muted-foreground">
          ({{ selected.length }}/{{ totalKeys }})
        </span>
      </h3>
      <div class="flex gap-1">
        <UiButton variant="ghost" size="sm" @click="selectAll">{{ t('roles.form.selectAll') }}</UiButton>
        <UiButton variant="ghost" size="sm" @click="clearAll">{{ t('roles.form.clearAll') }}</UiButton>
      </div>
    </div>

    <div class="space-y-2">
      <RolePermissionGroup
        v-for="group in catalog"
        :key="group.key"
        :group="group"
        :selected="selected"
        :selected-count="selectedInGroup(group)"
        :full="isGroupFull(group)"
        :partial="isGroupPartial(group)"
        @toggle="togglePermission"
        @toggle-group="toggleGroup"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'
import RolePermissionGroup from './RolePermissionGroup.vue'
import { useRolePermissions } from '../composables/use-role-permissions'
import type { PermissionGroup } from '../interfaces/permission-group.interface'

const { t } = useI18n()

const props = withDefaults(defineProps<{ catalog: PermissionGroup[]; selected?: string[] }>(), {
  selected: () => [],
})
const emit = defineEmits<{ 'update:selected': [value: string[]] }>()

/**
 * Staged locally rather than written straight through `defineModel`: a v-model
 * prop only reflects the parent on the NEXT tick, so two toggles in the same
 * tick would read a stale list and one would be lost.
 */
const selected = ref<string[]>([...props.selected])
watch(
  () => props.selected,
  (incoming) => {
    const same =
      incoming.length === selected.value.length &&
      incoming.every((key, i) => key === selected.value[i])
    if (!same) selected.value = [...incoming]
  },
)
watch(selected, (value) => emit('update:selected', [...value]))

const {
  selectedInGroup, isGroupFull, isGroupPartial,
  toggleGroup, togglePermission, selectAll, clearAll, totalKeys,
} = useRolePermissions(selected, toRef(props, 'catalog'))
</script>
