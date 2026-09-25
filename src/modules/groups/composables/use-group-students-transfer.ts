import { ref, computed } from 'vue'
import { useStudentTransfer } from '@/shared/composables/use-student-transfer'
import { fetchAllGroups } from '../api/groups.api'

/**
 * Bulk selection + transfer for the group detail students tab. Wraps the shared
 * transfer composable (one student card OR many students here) and owns the
 * checkbox selection, which is cleared after a successful move.
 *
 * `pageIds` are the ids currently shown (drives the "select all" checkbox);
 * `onDone` reloads the parent group + students so left students disappear.
 */
export function useGroupStudentsTransfer(
  groupId: number,
  groupName: () => string,
  pageIds: () => number[],
  onDone: () => Promise<void> | void,
) {
  const selected = ref<Set<number>>(new Set())

  const selectedIds = computed(() => [...selected.value])
  const selectedCount = computed(() => selected.value.size)
  const allSelected = computed(
    () => pageIds().length > 0 && pageIds().every((id) => selected.value.has(id)),
  )
  const someSelected = computed(() => selected.value.size > 0 && !allSelected.value)

  const isSelected = (id: number): boolean => selected.value.has(id)

  function toggle(id: number): void {
    const next = new Set(selected.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selected.value = next
  }
  function toggleAll(): void {
    selected.value = allSelected.value ? new Set() : new Set(pageIds())
  }
  function clear(): void {
    selected.value = new Set()
  }

  const transfer = useStudentTransfer(
    () => selectedIds.value,
    async () => {
      clear()
      await onDone()
    },
    () => fetchAllGroups(),
  )

  function openTransfer(): void {
    if (!selectedCount.value) return
    transfer.open(groupId, groupName())
  }

  return {
    selected,
    selectedIds,
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    toggle,
    toggleAll,
    clear,
    transfer,
    openTransfer,
  }
}
