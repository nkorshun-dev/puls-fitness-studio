import { holidays, scheduleExceptions, scheduleTemplate } from '../data/schedule-template'
import { DAY, addDays, atTime, fromISODate, startOfWeek, toISODate } from './dates'
import { minskDate } from './time'
import type { ClassItem } from './types'

export const WEEKS_AHEAD = 3

/** Детерминированное "случайное" число 0..1 по строке (FNV-1a + перемешивание). */
export function seeded(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 15
  h = Math.imul(h, 2246822507)
  h ^= h >>> 13
  return (h >>> 0) / 4294967296
}

export type DayPart = 'morning' | 'day' | 'evening'
export const dayPartOf = (time: string): DayPart => {
  const h = Number(time.slice(0, 2))
  return h < 12 ? 'morning' : h < 17 ? 'day' : 'evening'
}

/** Доля занятых мест: вечером в будни заполнено сильнее. */
export function occupancy(templateId: string, date: string, day: number, time: string): number {
  const r = seeded(`${templateId}@${date}`)
  const eveningWeekday = day < 5 && time >= '18:00'
  return eveningWeekday ? 0.7 + 0.4 * r : 0.15 + 0.65 * r
}

export function generateWeek(weekStart: Date, weekOffset: number): ClassItem[] {
  const out: ClassItem[] = []
  for (const t of scheduleTemplate) {
    const day = addDays(weekStart, t.day)
    const date = toISODate(day)
    const start = atTime(day, t.time)
    const ex = scheduleExceptions.find((e) => e.weekOffset === weekOffset && e.templateId === t.id)
    const holiday = holidays[date.slice(5)]
    const cancelReason = holiday ? `Праздничный день: ${holiday}` : ex?.cancelReason
    const booked = Math.min(t.capacity, Math.round(occupancy(t.id, date, t.day, t.time) * t.capacity))
    out.push({
      id: `${date}|${t.id}`,
      date,
      templateId: t.id,
      start,
      end: start + t.duration * 60_000,
      direction: t.direction,
      trainer: ex?.trainer ?? t.trainer,
      hall: t.hall,
      level: t.level,
      capacity: t.capacity,
      booked,
      waitlistBase: booked >= t.capacity ? Math.floor(seeded(`w${t.id}@${date}`) * 4) : 0,
      cancelReason,
      substituted: Boolean(ex?.trainer),
    })
  }
  return out.sort((a, b) => a.start - b.start)
}

const weekCache = new Map<string, ClassItem[]>()
const weekOffsetOf = (weekStart: Date, today: Date) =>
  Math.round((weekStart.getTime() - startOfWeek(today).getTime()) / (7 * DAY))

/** Неделя по смещению от текущей (0..2; допускаются и отрицательные для истории). */
export function getWeek(offset: number, today: Date = minskDate()): ClassItem[] {
  const weekStart = addDays(startOfWeek(today), offset * 7)
  const key = `${toISODate(weekStart)}:${offset}`
  let week = weekCache.get(key)
  if (!week) {
    week = generateWeek(weekStart, offset)
    weekCache.set(key, week)
  }
  return week
}

export function findClass(id: string, today: Date = minskDate()): ClassItem | undefined {
  const date = id.split('|')[0]
  if (!date) return undefined
  const offset = weekOffsetOf(startOfWeek(fromISODate(date)), today)
  return getWeek(offset, today).find((c) => c.id === id)
}

export function upcomingClasses(now: number, limit: number): ClassItem[] {
  const today = minskDate(now)
  const res: ClassItem[] = []
  for (let w = 0; w < WEEKS_AHEAD && res.length < limit; w++) {
    for (const c of getWeek(w, today)) if (c.end > now && !c.cancelReason) res.push(c)
  }
  return res.slice(0, limit)
}

export function classesOfToday(now: number): ClassItem[] {
  const today = toISODate(minskDate(now))
  return getWeek(0, minskDate(now)).filter((c) => c.date === today)
}
