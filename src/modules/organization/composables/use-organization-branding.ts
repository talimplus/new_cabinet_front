import { computed, reactive, ref } from 'vue'
import { t } from '@/locales'
import { useNotificationStore } from '@/stores/notification.store'
import { useBrandingStore } from '@/stores/branding.store'
import { updateOrganizationBranding } from '../api/organization.api'
import type { OrganizationBranding } from '../interfaces/organization.interface'

// Same limits as the backend (a base64 data URL is ~33% larger than the file).
export const MAX_LOGO_BYTES = 300 * 1024
export const MAX_FAVICON_BYTES = 100 * 1024

interface BrandForm {
  name: string
  logoUrl: string
  faviconUrl: string
}

/** Read an image file as a data URL — the project has no upload storage and the
 * logo is small and rarely changed, so it is stored inline. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Organization branding form: name (min 2 chars) + logo/favicon as data URLs.
 * Saving pushes the fresh brand into the shared branding store so the sidebar
 * logo and browser tab update immediately.
 */
export function useOrganizationBranding() {
  const notify = useNotificationStore()
  const brandingStore = useBrandingStore()

  const loading = ref(false)
  const saving = ref(false)
  const fileError = ref('')

  const form = reactive<BrandForm>({ name: '', logoUrl: '', faviconUrl: '' })
  const initial = reactive<BrandForm>({ name: '', logoUrl: '', faviconUrl: '' })

  const nameError = computed(() => (form.name.trim().length < 2 ? t('organization.nameError') : ''))
  const isDirty = computed(
    () =>
      form.name !== initial.name ||
      form.logoUrl !== initial.logoUrl ||
      form.faviconUrl !== initial.faviconUrl,
  )

  function apply(data: OrganizationBranding): void {
    form.name = data.name ?? ''
    form.logoUrl = data.logoUrl ?? ''
    form.faviconUrl = data.faviconUrl ?? ''
    Object.assign(initial, { name: form.name, logoUrl: form.logoUrl, faviconUrl: form.faviconUrl })
  }

  function reset(): void {
    Object.assign(form, initial)
    fileError.value = ''
  }

  async function pickFile(file: File, maxBytes: number, target: 'logoUrl' | 'faviconUrl'): Promise<void> {
    fileError.value = ''
    if (file.size > maxBytes) {
      fileError.value = t('organization.tooLarge', { size: Math.round(maxBytes / 1024) })
      return
    }
    try {
      form[target] = await readAsDataUrl(file)
    } catch {
      fileError.value = t('organization.readFailed')
    }
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      if (!brandingStore.loaded) await brandingStore.load()
      if (brandingStore.branding) apply(brandingStore.branding)
    } finally {
      loading.value = false
    }
  }

  async function save(): Promise<void> {
    if (nameError.value) return
    saving.value = true
    try {
      const data = await updateOrganizationBranding({
        name: form.name.trim(),
        logoUrl: form.logoUrl,
        faviconUrl: form.faviconUrl,
      })
      apply(data)
      brandingStore.set(data)
      notify.success(t('organization.saved'))
    } finally {
      saving.value = false
    }
  }

  return { loading, saving, fileError, form, nameError, isDirty, pickFile, reset, load, save }
}
