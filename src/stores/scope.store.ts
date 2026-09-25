import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchAllCenters } from '@/modules/centers/api/centers.api'
import { useUserStore } from '@/stores/user.store'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Center } from '@/modules/centers/interfaces/center.interface'

const STORAGE_KEY = 'activeCenterId'

/** Base role types that may switch centers — the owner side of the org (§7). */
const SWITCHER_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN]

function readStored(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const id = Number(raw)
    return Number.isFinite(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

/**
 * The **active center**, picked once in the header and applied everywhere
 * (`docs/02-migration-matrix.md` §4.3):
 *
 * - read requests get `centerId` injected by the http interceptor, but only on
 *   endpoints that accept it (`acceptsCenterId` in the api-permissions table);
 * - create forms send `centerIdForCreate`.
 *
 * `activeCenterId === null` means **"All centers"**: no `centerId` is sent and
 * the backend answers for the whole organization.
 *
 * A non-admin cannot switch — the backend pins them to `req.user.centerId`
 * anyway, so the frontend sends nothing and shows their center as a chip.
 */
export const useScopeStore = defineStore('scope', () => {
  const centers = ref<Center[]>([])
  const activeCenterId = ref<number | null>(readStored())
  const loading = ref(false)
  const loaded = ref(false)

  const userStore = useUserStore()

  const canSwitch = computed(() => {
    const role = userStore.user?.role
    return role !== undefined && SWITCHER_ROLES.includes(role)
  })

  const activeCenter = computed(
    () => centers.value.find((c) => c.id === activeCenterId.value) ?? null,
  )
  const defaultCenter = computed(
    () => centers.value.find((c) => c.isDefault) ?? centers.value[0] ?? null,
  )
  /** The signed-in user's own center — shown to those who cannot switch. */
  const ownCenter = computed(
    () => centers.value.find((c) => c.id === userStore.user?.centerId) ?? null,
  )

  /** What the interceptor appends. `undefined` = send no filter at all. */
  const requestCenterId = computed<number | undefined>(() => {
    if (!canSwitch.value) return undefined
    return activeCenterId.value ?? undefined
  })

  /**
   * Which center a newly created record belongs to: the active one, the default
   * when "All centers" is selected, or the user's own when they cannot switch.
   */
  const centerIdForCreate = computed<number | null>(() => {
    if (!canSwitch.value) return userStore.user?.centerId ?? null
    return activeCenterId.value ?? defaultCenter.value?.id ?? null
  })

  function setActive(id: number | null): void {
    activeCenterId.value = id
    try {
      if (id === null) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, String(id))
    } catch {
      /* storage unavailable (private mode) */
    }
  }

  /** Load the center list once; the layout does this after sign-in. */
  async function loadCenters(force = false): Promise<void> {
    if (loaded.value && !force) return
    if (!userStore.isAuthenticated) return
    loading.value = true
    try {
      centers.value = await fetchAllCenters()
      loaded.value = true
      // A stored center that no longer exists falls back to "All centers".
      if (activeCenterId.value !== null && !centers.value.some((c) => c.id === activeCenterId.value)) {
        setActive(null)
      }
    } catch {
      centers.value = []
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    centers.value = []
    loaded.value = false
    setActive(null)
  }

  return {
    centers,
    activeCenterId,
    activeCenter,
    defaultCenter,
    ownCenter,
    canSwitch,
    requestCenterId,
    centerIdForCreate,
    loading,
    loaded,
    loadCenters,
    setActive,
    reset,
  }
})
