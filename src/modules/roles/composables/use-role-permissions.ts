import { computed, type Ref } from 'vue'
import type { PermissionGroup } from '../interfaces/permission-group.interface'

/**
 * Group tick-box maths for the catalog: how many keys of a group are selected,
 * whether it is fully or partially ticked, and toggling a whole group at once.
 */
export function useRolePermissions(selected: Ref<string[]>, catalog: Ref<PermissionGroup[]>) {
  function selectedInGroup(group: PermissionGroup): number {
    return group.permissions.filter((p) => selected.value.includes(p.key)).length
  }

  function isGroupFull(group: PermissionGroup): boolean {
    return group.permissions.length > 0 && selectedInGroup(group) === group.permissions.length
  }

  function isGroupPartial(group: PermissionGroup): boolean {
    const count = selectedInGroup(group)
    return count > 0 && count < group.permissions.length
  }

  function toggleGroup(group: PermissionGroup, checked: boolean): void {
    const keys = group.permissions.map((p) => p.key)
    selected.value = checked
      ? Array.from(new Set([...selected.value, ...keys]))
      : selected.value.filter((key) => !keys.includes(key))
  }

  function togglePermission(key: string, checked: boolean): void {
    selected.value = checked
      ? Array.from(new Set([...selected.value, key]))
      : selected.value.filter((k) => k !== key)
  }

  function selectAll(): void {
    selected.value = catalog.value.flatMap((g) => g.permissions.map((p) => p.key))
  }
  function clearAll(): void {
    selected.value = []
  }

  const totalKeys = computed(() =>
    catalog.value.reduce((n, g) => n + g.permissions.length, 0),
  )

  return {
    selectedInGroup, isGroupFull, isGroupPartial,
    toggleGroup, togglePermission, selectAll, clearAll, totalKeys,
  }
}
