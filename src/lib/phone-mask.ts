/** Маска белорусского номера: +375 (29) 123-45-67. */
/** Длина префикса: «375» или «80» (внутренний формат 80XX…; кодов оператора на 80 в Беларуси нет). */
const prefixLen = (d: string) => (d.startsWith('375') ? 3 : d.startsWith('80') ? 2 : 0)

export const phoneDigits = (input: string) => {
  const d = input.replace(/\D/g, '')
  return d.slice(prefixLen(d)).slice(0, 9)
}

export const formatPhone = (input: string) => {
  const d = phoneDigits(input)
  if (!d) return ''
  let out = '+375'
  out += ` (${d.slice(0, 2)}`
  if (d.length >= 2) out += ')'
  if (d.length > 2) out += ` ${d.slice(2, 5)}`
  if (d.length > 5) out += `-${d.slice(5, 7)}`
  if (d.length > 7) out += `-${d.slice(7, 9)}`
  return out
}

export const isPhoneComplete = (input: string) => phoneDigits(input).length === 9

/**
 * Значение поля после ввода/вставки/удаления: сохраняет позицию курсора и даёт стереть знак маски
 * (иначе «)» или пробел тут же возвращались бы). prev — значение до изменения.
 */
export function maskChange(el: HTMLInputElement, prev: string): string {
  const raw = el.value
  const caret = el.selectionStart ?? raw.length
  const lead = prefixLen(raw.replace(/\D/g, ''))
  let d = phoneDigits(raw)
  let n = Math.max(0, raw.slice(0, caret).replace(/\D/g, '').length - lead)
  if (raw.length < prev.length && d === phoneDigits(prev) && n > 0) {
    d = d.slice(0, n - 1) + d.slice(n)
    n--
  }
  n = Math.min(n, d.length)
  const out = formatPhone(d)
  let pos = out.length
  if (n < d.length) {
    let seen = -3 // цифры префикса «375» не считаем
    for (let i = 0; i < out.length; i++) if (/\d/.test(out[i]) && ++seen === n) { pos = i + 1; break }
  }
  setTimeout(() => el.setSelectionRange(pos, pos), 0)
  return out
}
