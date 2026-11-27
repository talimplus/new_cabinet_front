import { ref } from 'vue'
import { fetchSalaryDetails } from '../api/payroll-details.api'
import type { SalaryDetails } from '../interfaces/salary-details.interface'

/** State for the salary breakdown page (`/payroll/:userId/:month`, month = "YYYY-MM"). */
export function useSalaryDetails(userId: () => number, month: () => string) {
  const details = ref<SalaryDetails | null>(null)
  const loading = ref(false)
  /** No salary for that person/month (404) — the page says so instead of an empty card. */
  const failed = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    failed.value = false
    try {
      details.value = await fetchSalaryDetails(userId(), month())
    } catch {
      details.value = null
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  return { details, loading, failed, load }
}
