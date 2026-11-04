import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateWeek, getWeek, upcomingClasses } from './schedule'
import { canBook } from './rules'
import { scheduleTemplate } from '../data/schedule-template'
import { startOfWeek } from './dates'
import { minskDate } from './time'

describe('генерация расписания', () => {
  const monday = new Date(Date.UTC(2026, 5, 1)) // понедельник, без праздников
  it('создаёт все занятия шаблона и стабильна между вызовами', () => {
    const a = generateWeek(monday, 0)
    expect(a).toHaveLength(scheduleTemplate.length)
    expect(generateWeek(monday, 0)).toEqual(a)
  })
  it('замена тренера и отмена из исключений', () => {
    const w = generateWeek(new Date(Date.UTC(2026, 5, 8)), 1)
    expect(w.find((c) => c.templateId === 'tue-0700-func')?.cancelReason).toBeTruthy()
    expect(w.find((c) => c.templateId === 'fri-1900-zumba')?.trainer).toBe('marina-l')
  })
  it('праздник отменяет занятия', () => {
    const w = generateWeek(new Date(Date.UTC(2026, 4, 4)), 0) // 9 мая — суббота
    expect(w.filter((c) => c.date === '2026-05-09').every((c) => c.cancelReason)).toBe(true)
  })
  it('занятость не превышает вместимость, вечер будней заполнен сильнее', () => {
    const w = generateWeek(monday, 0)
    expect(w.every((c) => c.booked <= c.capacity)).toBe(true)
    const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
    const ev = w.filter((c) => c.date < '2026-06-06' && c.templateId.match(/-(18|19|20|21)/)).map((c) => c.booked / c.capacity)
    const other = w.filter((c) => !c.templateId.match(/-(18|19|20|21)/)).map((c) => c.booked / c.capacity)
    expect(avg(ev)).toBeGreaterThan(avg(other))
  })
  it('getWeek кэширует результат', () => {
    const t = startOfWeek(minskDate())
    expect(getWeek(0, t)).toBe(getWeek(0, t))
  })
})

describe('часовой пояс Минска', () => {
  afterEach(() => vi.useRealTimers())
  it('в 23:45 по Минску: занятие сегодня в 23:30 прошло, завтра в 07:00 доступно (при любом TZ процесса)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-04T20:45:00Z'))
    const now = Date.now()
    const week = getWeek(0, minskDate(now)).concat(getWeek(1, minskDate(now)))
    const pick = (date: string, time: string) =>
      week.find((c) => c.date === date && new Date(c.start + 3 * 3600_000).toISOString().slice(11, 16) === time)
    const tomorrow = pick('2026-11-05', '07:00')
    expect(tomorrow).toBeDefined()
    expect(canBook(now, tomorrow!.start)).toBe(true)
    // занятие, начавшееся в 23:30 Минска (20:30Z): уже нельзя
    expect(canBook(now, Date.parse('2026-11-04T20:30:00Z'))).toBe(false)
    // сегодняшних занятий после 23:45 нет, список ближайших начинается завтра
    expect(upcomingClasses(now, 1)[0].date).toBe('2026-11-05')
  })
})
