import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandingImagePicker from '../BrandingImagePicker.vue'
import { t } from '@/locales'

describe('BrandingImagePicker', () => {
  function makeWrapper(modelValue: string) {
    return mount(BrandingImagePicker, {
      props: {
        modelValue,
        label: 'Logotip',
        hint: 'PNG, JPG, WEBP yoki SVG, 300 KB gacha.',
        accept: 'image/png,image/jpeg,image/webp,image/svg+xml',
        variant: 'logo',
      },
    })
  }

  it('renders the label and hint', () => {
    const wrapper = makeWrapper('')
    expect(wrapper.text()).toContain('Logotip')
    expect(wrapper.text()).toContain('PNG, JPG, WEBP yoki SVG, 300 KB gacha.')
  })

  it('shows the "no image" placeholder and no Remove button when modelValue is empty', () => {
    const wrapper = makeWrapper('')

    expect(wrapper.text()).toContain(t('organization.noImage'))
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(t('organization.remove'))
  })

  it('shows the image and the Remove button when modelValue is set', () => {
    const src = 'data:image/png;base64,abc'
    const wrapper = makeWrapper(src)

    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe(src)
    expect(wrapper.text()).toContain(t('organization.remove'))
    expect(wrapper.text()).not.toContain(t('organization.noImage'))
  })

  it('clicking Remove emits update:modelValue with an empty string', async () => {
    const wrapper = makeWrapper('data:image/png;base64,abc')

    const buttons = wrapper.findAll('button')
    const removeButton = buttons.find((b) => b.text().includes(t('organization.remove')))
    expect(removeButton).toBeTruthy()
    await removeButton!.trigger('click')

    const emittedUpdate = wrapper.emitted('update:modelValue')
    expect(emittedUpdate).toBeTruthy()
    expect(emittedUpdate![emittedUpdate!.length - 1]).toEqual([''])
  })

  it('selecting a file on the hidden input emits pick with the File', async () => {
    const wrapper = makeWrapper('')
    const file = new File([new Uint8Array([1, 2, 3])], 'logo.png', { type: 'image/png' })
    const input = wrapper.get('input[type="file"]')

    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')

    const emittedPick = wrapper.emitted('pick')
    expect(emittedPick).toBeTruthy()
    expect(emittedPick![0]![0]).toBe(file)
  })
})
