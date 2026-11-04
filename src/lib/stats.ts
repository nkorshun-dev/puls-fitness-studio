import { DAY, addDays, startOfWeek } from './dates'
import { minskDate } from './time'
import type { HistoryItem } from './types'

const WEEK = 7 * DAY

/** Сводка посещений для кабинета; недели считаются по Минску с понедельника. */
export function visitStats(history: HistoryItem[], now: number, weeks = 8) {
  const today = minskDate(now)
  const thisWeek = startOfWeek(today).getTime()
  const counts = new Map<string, number>()
  const perWeek = new Map<number, number>() // 0 = текущая неделя, 1 = прошлая…
  let thisMonth = 0
  for (const h of history) {
    const d = minskDate(h.start)
    if (d.getUTCFullYear() === today.getUTCFullYear() && d.getUTCMonth() === today.getUTCMonth()) thisMonth++
    counts.set(h.direction, (counts.get(h.direction) ?? 0) + 1)
    const ago = Math.round((thisWeek - startOfWeek(d).getTime()) / WEEK)
    if (ago >= 0) perWeek.set(ago, (perWeek.get(ago) ?? 0) + 1)
  }
  // серия: недели подряд с посещениями; пустая текущая неделя серию ещё не обрывает
  let streak = 0
  for (let w = perWeek.has(0) ? 0 : 1; perWeek.has(w); w++) streak++
  const favorite = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const weekly = Array.from({ length: weeks }, (_, i) => {
    const ago = weeks - 1 - i
    return { monday: addDays(new Date(thisWeek), -7 * ago), count: perWeek.get(ago) ?? 0 }
  })
  return { thisMonth, total: history.length, favorite, streak, weekly }
}
