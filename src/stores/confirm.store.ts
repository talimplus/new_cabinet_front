import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface ConfirmRequest {
  title: string
  message: string
  confirmLabel?: string
  /** `danger` for destructive actions; `primary` otherwise. */
  variant?: 'danger' | 'primary'
}

interface ConfirmState extends ConfirmRequest {
  open: boolean
}

/**
 * One app-wide "Are you sure?" dialog, awaited from plain composables:
 * `if (!(await confirm.ask({ title, message }))) return`. Rendered once by
 * `AppConfirmHost` (App.vue), so a flow can ask without its view wiring a
 * dialog of its own. A second `ask` while one is open cancels the first.
 */
export const useConfirmStore = defineStore('confirm', () => {
  const state = reactive<ConfirmState>({ open: false, title: '', message: '' })
  let resolver: ((ok: boolean) => void) | null = null

  function settle(ok: boolean): void {
    const r = resolver
    resolver = null
    state.open = false
    r?.(ok)
  }

  function ask(req: ConfirmRequest): Promise<boolean> {
    settle(false)
    Object.assign(state, { confirmLabel: undefined, variant: 'primary' }, req, { open: true })
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  return { state, ask, accept: () => settle(true), cancel: () => settle(false) }
})
