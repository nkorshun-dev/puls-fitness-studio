import type { Level } from '../data/schedule-template'
import { formatTime } from './dates'
import { dayPartOf, type DayPart } from './schedule'
import type { ClassItem } from './types'

export interface Filters {
  dir: string
  trainer: string
  level: '' | Level
  part: '' | DayPart
  hall: string
  free: boolean
}

export const emptyFilters: Filters = { dir: '', trainer: '', level: '', part: '', hall: '', free: false }

const oneOf = <T extends string>(v: string | null, list: readonly T[]): '' | T => (list.includes(v as T) ? (v as T) : '')

/** Фильтры живут в URL: ?dir=yoga&trainer=anna-k&level=beginner&part=evening&hall=small&free=1&week=1 */
export function parseFilters(p: URLSearchParams): Filters {
  return {
    dir: p.get('dir') ?? '',
    trainer: p.get('trainer') ?? '',
    level: oneOf(p.get('level'), ['beginner', 'all', 'advanced'] as const),
    part: oneOf(p.get('part'), ['morning', 'day', 'evening'] as const),
    hall: p.get('hall') ?? '',
    free: p.get('free') === '1',
  }
}

export function parseWeek(p: URLSearchParams): number {
  const w = Number(p.get('week'))
  return Number.isInteger(w) && w >= 0 && w <= 2 ? w : 0
}

export function toParams(f: Filters, week: number): URLSearchParams {
  const p = new URLSearchParams()
  if (f.dir) p.set('dir', f.dir)
  if (f.trainer) p.set('trainer', f.trainer)
  if (f.level) p.set('level', f.level)
  if (f.part) p.set('part', f.part)
  if (f.hall) p.set('hall', f.hall)
  if (f.free) p.set('free', '1')
  if (week) p.set('week', String(week))
  return p
}

export const hasFilters = (f: Filters) => Object.values(f).some(Boolean)

export function matches(c: ClassItem, f: Filters, left: number): boolean {
  return (
    (!f.dir || c.direction === f.dir) &&
    (!f.trainer || c.trainer === f.trainer) &&
    (!f.level || c.level === f.level) &&
    (!f.part || dayPartOf(formatTime(c.start)) === f.part) &&
    (!f.hall || c.hall === f.hall) &&
    (!f.free || left > 0)
  )
}
