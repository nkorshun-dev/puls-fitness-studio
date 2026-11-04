import { MINSK_OFFSET, minskDate } from './time'

export const MIN = 60_000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR

export const weekdayShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
export const weekdayLong = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
const monthsGen = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

// Date-аргументы здесь — "минские даты" (см. time.ts), поля читаются через UTC.
export const startOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

export const addDays = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n))

/** Индекс дня недели: 0 = понедельник. */
export const weekdayIndex = (d: Date) => (d.getUTCDay() + 6) % 7

export const startOfWeek = (d: Date) => addDays(startOfDay(d), -weekdayIndex(d))

const p2 = (n: number) => String(n).padStart(2, '0')

export const toISODate = (d: Date) => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`

export const fromISODate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export const isSameDay = (a: Date, b: Date) => toISODate(a) === toISODate(b)

/** Время "HH:MM" по Минску на дату -> настоящие миллисекунды. */
export const atTime = (day: Date, time: string) => {
  const [h, m] = time.split(':').map(Number)
  return Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m) - MINSK_OFFSET
}

export const formatTime = (ms: number) => {
  const d = minskDate(ms)
  return `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`
}

export const formatDayMonth = (d: Date) => `${d.getUTCDate()} ${monthsGen[d.getUTCMonth()]}`

export const formatDateTime = (ms: number) => {
  const d = minskDate(ms)
  return `${weekdayShort[weekdayIndex(d)]}, ${formatDayMonth(d)}, ${formatTime(ms)}`
}

export const formatRange = (start: Date, end: Date) => `${formatDayMonth(start)} — ${formatDayMonth(end)}`

export const formatFullDate = (ms: number) => {
  const d = minskDate(ms)
  return `${d.getUTCDate()} ${monthsGen[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
