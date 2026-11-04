import { describe, expect, it } from 'vitest'
import { HOUR } from '../lib/dates'
import type { ClassRef } from '../lib/types'
import { initialState, transition } from './accountReducer'

const NOW = Date.UTC(2026, 10, 3, 6, 0)
const cls = (id: string, hoursAhead: number): ClassRef => ({
  classId: id, start: NOW + hoursAhead * HOUR, end: NOW + (hoursAhead + 1) * HOUR, direction: 'yoga', trainer: 'elena-v', hall: 'small',
})

function ready() {
  let s = transition(initialState, { type: 'LOGIN', name: 'Аня', phone: '+375 (29) 111-22-33', now: NOW }).state
  s = transition(s, { type: 'BUY', planId: 'pack8', now: NOW }).state
  return s
}

describe('сценарии кабинета', () => {
  it('запись списывает занятие, ранняя отмена возвращает', () => {
    let s = transition(ready(), { type: 'BOOK', cls: cls('a', 10), free: 5, now: NOW }).state
    expect(s.membership?.visitsLeft).toBe(7)
    s = transition(s, { type: 'CANCEL', classId: 'a', now: NOW }).state
    expect(s.membership?.visitsLeft).toBe(8)
    expect(s.bookings).toHaveLength(0)
  })
  it('отмена менее чем за 3 часа оставляет списание', () => {
    let s = transition(ready(), { type: 'BOOK', cls: cls('a', 2), free: 5, now: NOW }).state
    s = transition(s, { type: 'CANCEL', classId: 'a', now: NOW }).state
    expect(s.membership?.visitsLeft).toBe(7)
  })
  it('нельзя записаться на пересекающееся занятие', () => {
    const s = transition(ready(), { type: 'BOOK', cls: cls('a', 10), free: 5, now: NOW }).state
    expect(transition(s, { type: 'BOOK', cls: cls('b', 10.5), free: 5, now: NOW }).result.ok).toBe(false)
  })
  it('лист ожидания: номер в очереди и переход в записи', () => {
    let s = transition(ready(), { type: 'WAIT', cls: cls('w', 10), free: 0, ahead: 1, now: NOW }).state
    expect(s.waitlist[0].ahead).toBe(1)
    s = transition(s, { type: 'RELEASE', classId: 'w', now: NOW }).state
    expect(s.waitlist[0].ahead).toBe(0)
    s = transition(s, { type: 'RELEASE', classId: 'w', now: NOW }).state
    expect(s.waitlist).toHaveLength(0)
    expect(s.bookings[0].classId).toBe('w')
    expect(s.membership?.visitsLeft).toBe(7)
  })
  it('лист ожидания отказывает при пересечении с записью', () => {
    const s = transition(ready(), { type: 'BOOK', cls: cls('a', 10), free: 5, now: NOW }).state
    const r = transition(s, { type: 'WAIT', cls: cls('w', 10.5), free: 0, ahead: 1, now: NOW })
    expect(r.result.ok).toBe(false)
    expect(r.result.message).toMatch(/лист ожидания/)
    expect(r.state.waitlist).toHaveLength(0)
  })
  it('пробное занятие доступно один раз', () => {
    let s = transition(ready(), { type: 'BUY', planId: 'trial', now: NOW }).state
    s = transition(s, { type: 'BUY', planId: 'trial', now: NOW }).state
    expect(transition(s, { type: 'BUY', planId: 'trial', now: NOW }).result.ok).toBe(false)
  })
  it('прошедшие записи уходят в историю', () => {
    let s = transition(ready(), { type: 'BOOK', cls: cls('a', 1), free: 5, now: NOW }).state
    s = transition(s, { type: 'SYNC', now: NOW + 3 * HOUR }).state
    expect(s.bookings).toHaveLength(0)
    expect(s.history.some((h) => h.classId === 'a')).toBe(true)
  })
})
