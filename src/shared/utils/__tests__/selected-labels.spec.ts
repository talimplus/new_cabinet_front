import { describe, it, expect } from 'vitest'
import { selectedLabels } from '../selected-labels'

const options = [
  { label: 'Dushanba', value: 1 },
  { label: 'Seshanba', value: 2 },
  { label: 'Chorshanba', value: 3 },
]

describe('selectedLabels', () => {
  it('joins the picked labels in the options order, not the click order', () => {
    const picked = [options[2], options[0]]
    expect(selectedLabels(picked, options, 'label', 'value')).toBe('Dushanba, Chorshanba')
  })

  it('reads custom label/value props', () => {
    const custom = [{ name: 'A-1', id: 7 }, { name: 'B-2', id: 8 }]
    expect(selectedLabels([{ name: 'B-2', id: 8 }], custom, 'name', 'id')).toBe('B-2')
  })

  it('escapes markup, since the package renders it with v-html', () => {
    const risky = [{ label: '<b>x</b> & "y"', value: 1 }]
    expect(selectedLabels(risky, risky, 'label', 'value')).toBe('&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;')
  })

  it('returns an empty string for a non-array value', () => {
    expect(selectedLabels(null, options, 'label', 'value')).toBe('')
  })
})
