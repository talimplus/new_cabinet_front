import { reactive, ref } from 'vue'
import {
  fetchLeads, createLead, updateLead, deleteLead, changeLeadStatus, transferLeadToStudent,
} from '../api/leads.api'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { LeadStatus } from '../enums/lead-status.enum'
import { toDateString } from '@/shared/utils/format-date'
import type { Lead } from '../interfaces/lead.interface'
import type { LeadForm } from '../interfaces/lead-form.interface'
import type { LeadsParams } from '../interfaces/lead-params.interface'
import type { LeadTransferForm } from '../interfaces/lead-transfer-form.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

export interface LeadFiltersState {
  name: string
  phone: string
  status: LeadStatus | null
  groupId: number | null
  followUpDate: Date | null
  page: number
  perPage: number
}

interface DiscardDialogState {
  open: boolean
  lead: Lead | null
}

/** List/state logic for the leads page (list, filters, form modal, discard dialog). */
export function useLeads() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<Lead[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const groupOptions = ref<SelectOption[]>([])
  const filters = reactive<LeadFiltersState>({
    name: '', phone: '', status: null, groupId: null, followUpDate: null, page: 1, perPage: 10,
  })

  const modalOpen = ref(false)
  const editing = ref<Lead | null>(null)
  const discardDialog = reactive<DiscardDialogState>({ open: false, lead: null })

  async function load(): Promise<void> {
    loading.value = true
    try {
      const params: LeadsParams = {
        page: filters.page,
        perPage: filters.perPage,
        name: filters.name || undefined,
        phone: filters.phone || undefined,
        status: filters.status ?? undefined,
        groupId: filters.groupId ?? undefined,
        followUpDate: toDateString(filters.followUpDate) || undefined,
      }
      const { data, meta } = await fetchLeads(params)
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  async function loadGroups(): Promise<void> {
    const groups = await optionalRequest(fetchAllGroups(), [])
    groupOptions.value = groups.map((g) => ({ label: g.name, value: g.id }))
  }

  function resetFilters(): void {
    filters.name = ''
    filters.phone = ''
    filters.status = null
    filters.groupId = null
    filters.followUpDate = null
    filters.page = 1
  }

  async function init(): Promise<void> {
    resetFilters()
    await Promise.all([load(), loadGroups()])
  }


  function applyFilters(): void {
    filters.page = 1
    load()
  }
  function search(): void {
    applyFilters()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openCreate(): void {
    editing.value = null
    modalOpen.value = true
  }
  function openEdit(lead: Lead): void {
    editing.value = lead
    modalOpen.value = true
  }

  async function submit(form: LeadForm): Promise<void> {
    if (editing.value) {
      await updateLead(editing.value.id, form)
    } else {
      await createLead({ ...form, status: LeadStatus.NEW })
    }
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }

  async function remove(id: number): Promise<void> {
    if (!window.confirm(t('leads.confirmDelete'))) return
    await deleteLead(id)
    notify.success(t('common.deleted'))
    await load()
  }

  async function applyStatus(lead: Lead, next: LeadStatus, reason?: string): Promise<void> {
    lead.statusLoading = true
    try {
      await changeLeadStatus(lead.id, next, reason)
      notify.success(t('leads.statusChanged'))
      await load()
    } finally {
      lead.statusLoading = false
    }
  }

  /** Entry point for a status change from the table; DISCARDED opens the dialog. */
  function requestStatus(lead: Lead, next: LeadStatus): void {
    if (next === LeadStatus.DISCARDED) {
      discardDialog.open = true
      discardDialog.lead = lead
      return
    }
    applyStatus(lead, next)
  }

  async function confirmDiscard(reason: string): Promise<void> {
    if (discardDialog.lead) {
      await applyStatus(discardDialog.lead, LeadStatus.DISCARDED, reason || undefined)
    }
    discardDialog.open = false
  }

  async function transferToStudent(form: LeadTransferForm): Promise<void> {
    if (!editing.value) return
    await transferLeadToStudent(editing.value.id, form)
    notify.success(t('leads.transferred'))
    modalOpen.value = false
    await load()
  }

  return {
    scope, rows, totalPages, loading, filters, groupOptions,
    modalOpen, editing, discardDialog,
    init, search, applyFilters, setPage,
    openCreate, openEdit, submit, remove, requestStatus, confirmDiscard, transferToStudent,
  }
}
