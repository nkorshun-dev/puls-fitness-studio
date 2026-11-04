import { describe, expect, it } from 'vitest'
import { DAY } from './dates'
import { visitStats } from './stats'

// ср 18 ноября 2026, 12:00 по Минску
const NOW = Date.UTC(2026, 10, 18, 9, 0)
const visit = (daysAgo: number, direction = 'yoga') => ({ classId: String(daysAgo), start: NOW - daysAgo * DAY, direction, trainer: 'elena-v' })

describe('visitStats', () => {
  it('пустая история', () => {
    const s = visitStats([], NOW)
    expect(s).toMatchObject({ thisMonth: 0, total: 0, favorite: null, streak: 0 })
    expect(s.weekly).toHaveLength(8)
    expect(s.weekly.every((w) => w.count === 0)).toBe(true)
  })
  it('месяц, любимое направление, недели и серия', () => {
    // 1 = вт этой недели; 7, 8 = прошлая неделя; 14 = позапрошлая; 28 = 4 недели назад (21 окт)
    const s = visitStats([visit(1), visit(7, 'pilates'), visit(8, 'pilates'), visit(14, 'pilates'), visit(28)], NOW)
    expect(s.thisMonth).toBe(4)
    expect(s.total).toBe(5)
    expect(s.favorite).toBe('pilates')
    expect(s.streak).toBe(3)
    expect(s.weekly.map((w) => w.count)).toEqual([0, 0, 0, 1, 0, 1, 2, 1])
  })
  it('пустая текущая неделя не обрывает серию', () => {
    expect(visitStats([visit(7), visit(14)], NOW).streak).toBe(2)
    expect(visitStats([visit(14)], NOW).streak).toBe(0)
  })
})
