/** Склонение: plural(5, ['место','места','мест']) */
export const plural = (n: number, forms: [string, string, string]) => {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}

export const formatBYN = (n: number) => `${String(n).replace('.', ',')} BYN`

export const spotsText = (left: number, capacity: number) =>
  left <= 0 ? 'мест нет' : `осталось ${left} из ${capacity}`

export const spotsAria = (left: number) =>
  left <= 0 ? 'мест нет' : `осталось ${left} ${plural(left, ['место', 'места', 'мест'])}`

export const visitsText = (n: number) => `${n} ${plural(n, ['занятие', 'занятия', 'занятий'])}`
