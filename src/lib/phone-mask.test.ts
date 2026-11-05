import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatPhone, maskChange } from './phone-mask'

const field = (value: string, caret = value.length) =>
  ({ value, selectionStart: caret, setSelectionRange: vi.fn() }) as unknown as HTMLInputElement

afterEach(() => vi.useRealTimers())

describe('маска телефона', () => {
  it('форматирует ввод и вставку с кодом страны', () => {
    expect(formatPhone('291234567')).toBe('+375 (29) 123-45-67')
    expect(formatPhone('+375291234567')).toBe('+375 (29) 123-45-67')
    expect(formatPhone('80291234567')).toBe('+375 (29) 123-45-67')
  })
  it('Backspace по знаку маски стирает цифру, а не возвращает знак', () => {
    // было «+375 (29) 123», стёрли пробел -> «+375 (29)123»
    expect(maskChange(field('+375 (29)123', 9), '+375 (29) 123')).toBe('+375 (21) 23')
  })
  it('Backspace по цифре в конце работает', () => {
    expect(maskChange(field('+375 (29) 12'), '+375 (29) 123')).toBe('+375 (29) 12')
  })
  it('правка в середине ставит курсор на место', () => {
    vi.useFakeTimers()
    const el = field('+375 (2) 123-45-67', 7) // стёрли «9»
    expect(maskChange(el, '+375 (29) 123-45-67')).toBe('+375 (21) 234-56-7')
    vi.runAllTimers()
    expect(el.setSelectionRange).toHaveBeenCalledWith(7, 7)
  })
  it('набранный по символам префикс 375/80 не становится кодом оператора', () => {
    expect(formatPhone('+375 (375')).toBe('')
    expect(formatPhone('+375 (80')).toBe('')
    expect(formatPhone('+375 (8')).toBe('+375 (8')
    expect(formatPhone('+375 (37')).toBe('+375 (37)')
    expect(formatPhone('+375 29 123-45-67')).toBe('+375 (29) 123-45-67')
  })
  it('вставка поверх выделенного номера не теряет цифру', () => {
    for (const t of ['+375 29 123-45-67', '80291234567', '+375291234567'])
      expect(maskChange(field(t), '+375 (29) 123-45-67')).toBe('+375 (29) 123-45-67')
  })
})
