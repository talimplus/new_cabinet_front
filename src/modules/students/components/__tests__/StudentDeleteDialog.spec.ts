import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentDeleteDialog from '../StudentDeleteDialog.vue'
import { t } from '@/locales'

afterEach(() => {
  document.body.innerHTML = ''
})

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(StudentDeleteDialog, {
    attachTo: document.body,
    props: { open: true, name: 'Ali Valiyev', ...props },
  })
}

function button(label: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll('button')).find((b) =>
    b.textContent?.includes(label),
  )
}

describe('StudentDeleteDialog', () => {
  it('renders title and message with the student name', () => {
    mountDialog()
    expect(document.body.textContent).toContain(t('students.delete.title'))
    expect(document.body.textContent).toContain(t('students.delete.message', { name: 'Ali Valiyev' }))
  })

  it('renders nothing when closed', () => {
    mountDialog({ open: false })
    expect(document.body.textContent).not.toContain(t('students.delete.title'))
  })

  it('emits confirm when the delete button is clicked', async () => {
    const wrapper = mountDialog()
    button(t('common.delete'))?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mountDialog()
    button(t('common.cancel'))?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('disables cancel while loading', () => {
    mountDialog({ loading: true })
    expect(button(t('common.cancel'))?.disabled).toBe(true)
  })
})
