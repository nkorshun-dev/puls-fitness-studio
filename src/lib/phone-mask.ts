/** Маска белорусского номера: +375 (29) 123-45-67. */
/**
 * 9 цифр номера без кода страны. «+375» маски (или его стёртая часть) — не номер; затем снимаем набранный
 * пользователем 375/80: кодов оператора на 37 и 80 нет, поэтому «+375 (375…» и «+375 (80…» — это префикс.
 */
export const phoneDigits = (input: string) =>
  input.replace(/^\s*\+(375|37|3)?/, '').replace(/\D/g, '').replace(/^375/, '').replace(/^80/, '').slice(0, 9)

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
  let d = phoneDigits(raw)
  let n = phoneDigits(raw.slice(0, caret)).length
  // стёрли один знак маски (Backspace/Delete), а не заменили всё поле вставкой — убираем цифру перед ним
  if (raw === prev.slice(0, caret) + prev.slice(caret + 1) && d === phoneDigits(prev) && n > 0) {
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
  // в конце поля React сам оставит курсор в конце; отложенный вызов при быстром наборе вернул бы его назад
  if (pos < out.length) setTimeout(() => el.setSelectionRange(pos, pos), 0)
  return out
}
