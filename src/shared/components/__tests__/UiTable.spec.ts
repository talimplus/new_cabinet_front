import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import UiTable from '../UiTable.vue'
import UiSpinner from '../UiSpinner.vue'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const columns: TableColumn[] = [
  { key: 'name', label: 'Ism' },
  { key: 'age', label: 'Yosh', align: 'right' },
]
const rows = [
  { id: 1, name: 'Ali', age: 20 },
  { id: 2, name: 'Vali', age: 25 },
]

describe('UiTable', () => {
  it('renders a header cell per column', () => {
    const wrapper = mount(UiTable, { props: { columns, rows: [] } })
    const heads = wrapper.findAll('thead th')
    expect(heads.map((h) => h.text())).toEqual(['Ism', 'Yosh'])
  })

  it('renders a row per item with default cell content', () => {
    const wrapper = mount(UiTable, { props: { columns, rows } })
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows.length).toBe(2)
    expect(wrapper.text()).toContain('Ali')
    expect(wrapper.text()).toContain('Vali')
    expect(wrapper.text()).toContain('20')
  })

  it('lets a cell-<key> slot override the default cell content', () => {
    const wrapper = mount(UiTable, {
      props: { columns, rows },
      slots: {
        'cell-name': (props: { value: unknown }) => h('span', { class: 'custom' }, `>>${props.value}`),
      },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
    expect(wrapper.text()).toContain('>>Ali')
  })

  it('renders the actions slot with an extra header cell', () => {
    const wrapper = mount(UiTable, {
      props: { columns, rows },
      slots: { actions: () => h('button', { class: 'act' }, 'Edit') },
    })
    // header gets an extra (empty) th for the actions column
    expect(wrapper.findAll('thead th').length).toBe(3)
    // once per row in the table AND once per row in the mobile card list
    expect(wrapper.findAll('tbody button.act').length).toBe(2)
    expect(wrapper.findAll('article button.act').length).toBe(2)
  })

  it('shows a spinner while loading (typical case: empty rows)', () => {
    const wrapper = mount(UiTable, { props: { columns, rows: [], loading: true } })
    expect(wrapper.findComponent(UiSpinner).exists()).toBe(true)
    // while loading, the empty-state text must not be shown
    expect(wrapper.text()).not.toContain('Ma’lumot yo‘q')
  })

  it('shows emptyText when there are no rows', () => {
    const wrapper = mount(UiTable, {
      props: { columns, rows: [], emptyText: 'Hech narsa yo‘q' },
    })
    expect(wrapper.text()).toContain('Hech narsa yo‘q')
  })

  describe('rowClass', () => {
    it('applies the returned class to both the <tr> and the <article> for that row', () => {
      const wrapper = mount(UiTable, {
        props: {
          columns,
          rows,
          rowClass: (row) => (row.id === 1 ? 'bg-danger-soft/40' : undefined),
        },
      })
      const trs = wrapper.findAll('tbody tr')
      expect(trs[0]!.classes().join(' ')).toContain('bg-danger-soft/40')
      expect(trs[1]!.classes().join(' ')).not.toContain('bg-danger-soft/40')

      const articles = wrapper.findAll('article')
      expect(articles[0]!.classes().join(' ')).toContain('bg-danger-soft/40')
      expect(articles[1]!.classes().join(' ')).not.toContain('bg-danger-soft/40')
    })

    it('passes the full row to rowClass', () => {
      const rowClass = vi.fn<(row: Record<string, unknown>) => string | undefined>(
        () => undefined,
      )
      mount(UiTable, { props: { columns, rows, rowClass } })
      expect(rowClass).toHaveBeenCalledWith(rows[0])
      expect(rowClass).toHaveBeenCalledWith(rows[1])
    })

    it('does not crash when rowClass is omitted', () => {
      const wrapper = mount(UiTable, { props: { columns, rows } })
      expect(wrapper.findAll('tbody tr')).toHaveLength(2)
      expect(wrapper.findAll('article')).toHaveLength(2)
    })
  })

  describe('mobile cards', () => {
    it('renders one card per row alongside the table', () => {
      const wrapper = mount(UiTable, { props: { columns, rows } })
      expect(wrapper.findAll('article')).toHaveLength(2)
    })

    it('uses the first column as the card heading and the rest as label/value rows', () => {
      const wrapper = mount(UiTable, { props: { columns, rows } })
      const card = wrapper.findAll('article')[0]!
      expect(card.text()).toContain('Ali')
      expect(card.find('dt').text()).toBe('Yosh')
      expect(card.find('dd').text()).toBe('20')
    })

    it('promotes the column marked primary to the heading', () => {
      const wrapper = mount(UiTable, {
        props: {
          columns: [{ key: 'age', label: 'Yosh' }, { key: 'name', label: 'Ism', primary: true }],
          rows,
        },
      })
      const card = wrapper.findAll('article')[0]!
      expect(card.find('dt').text()).toBe('Yosh')
      expect(card.text().startsWith('Ali')).toBe(true)
    })

    it('leaves out columns marked hideOnMobile', () => {
      const wrapper = mount(UiTable, {
        props: {
          columns: [{ key: 'name', label: 'Ism' }, { key: 'age', label: 'Yosh', hideOnMobile: true }],
          rows,
        },
      })
      const card = wrapper.findAll('article')[0]!
      expect(card.text()).toContain('Ali')
      expect(card.text()).not.toContain('Yosh')
    })

    it('re-uses the same cell-<key> slots as the table', () => {
      const wrapper = mount(UiTable, {
        props: { columns, rows },
        slots: {
          'cell-name': (props: { value: unknown }) => h('span', { class: 'custom' }, `>>${props.value}`),
        },
      })
      expect(wrapper.findAll('article .custom')).toHaveLength(2)
    })

    it('shows the empty state as a card too', () => {
      const wrapper = mount(UiTable, {
        props: { columns, rows: [], emptyText: 'Bo‘sh' },
      })
      expect(wrapper.findAll('article')).toHaveLength(0)
      expect(wrapper.text()).toContain('Bo‘sh')
    })
  })
})
