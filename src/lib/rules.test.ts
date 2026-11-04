import { describe, expect, it } from 'vitest'
import { HOUR, MIN } from './dates'
import {
  cancelPolicy, canBook, chargeVisit, checkMembership, decideBooking, findConflict, freezeMembership,
  overlaps, promoteFromWaitlist, refundVisit, releaseSeat, seatsLeft, unfreezeMembership, waitlistPosition,
} from './rules'
import type { ClassRef, UserMembership } from './types'

const NOW = Date.UTC(2026, 10, 3, 9, 0)
const at = (h: number, m = 0) => Date.UTC(2026, 10, 3, h - 3, m)

const mem = (o: Partial<UserMembership> = {}): UserMembership => ({
  planId: 'pack8', name: '8 занятий', activatedAt: NOW, expiresAt: NOW + 30 * 24 * HOUR,
  visitsLeft: 8, visitsTotal: 8, morningOnly: false, frozenUntil: null, freezeDaysLeft: 14, ...o,
})
const cls = (id: string, start: number, mins = 60): ClassRef => ({
  classId: id, start, end: start + mins * MIN, direction: 'yoga', trainer: 'elena-v', hall: 'small',
})
const empty = { membership: mem(), bookings: [], waitlist: [] }

describe('запись не позже чем за 30 минут', () => {
  it('за 31 минуту можно, ровно за 30 можно, за 29 нельзя', () => {
    expect(canBook(NOW, NOW + 31 * MIN)).toBe(true)
    expect(canBook(NOW, NOW + 30 * MIN)).toBe(true)
    expect(canBook(NOW, NOW + 29 * MIN)).toBe(false)
  })
  it('на начавшееся занятие нельзя', () => expect(canBook(NOW, NOW - MIN)).toBe(false))
})

describe('отмена без списания не позже чем за 3 часа', () => {
  it('за 3 часа и раньше — бесплатно', () => {
    expect(cancelPolicy(NOW, NOW + 3 * HOUR)).toBe('free')
    expect(cancelPolicy(NOW, NOW + 10 * HOUR)).toBe('free')
  })
  it('позже чем за 3 часа — со списанием', () => expect(cancelPolicy(NOW, NOW + 3 * HOUR - MIN)).toBe('late'))
  it('после начала — started', () => expect(cancelPolicy(NOW, NOW)).toBe('started'))
})

describe('пересечения', () => {
  const a = { start: 100, end: 200 }
  it('пересекающиеся', () => expect(overlaps(a, { start: 150, end: 250 })).toBe(true))
  it('вложенные', () => expect(overlaps(a, { start: 120, end: 130 })).toBe(true))
  it('встык не пересекаются', () => expect(overlaps(a, { start: 200, end: 300 })).toBe(false))
  it('findConflict находит конфликт', () => {
    expect(findConflict({ start: 190, end: 260 }, [a])).toBe(a)
    expect(findConflict({ start: 200, end: 260 }, [a])).toBeUndefined()
  })
})

describe('места и лист ожидания', () => {
  it('seatsLeft не уходит в минус', () => {
    expect(seatsLeft(14, 11)).toBe(3)
    expect(seatsLeft(8, 9)).toBe(0)
  })
  it('номер в очереди', () => {
    expect(waitlistPosition(0)).toBe(1)
    expect(waitlistPosition(2)).toBe(3)
  })
  it('освободилось место: первый в очереди получает его', () => {
    expect(releaseSeat(0)).toEqual({ promoted: true, ahead: 0 })
  })
  it('освободилось место: остальные сдвигаются', () => {
    expect(releaseSeat(2)).toEqual({ promoted: false, ahead: 1 })
  })
  it('promoteFromWaitlist отдаёт места первым', () => {
    expect(promoteFromWaitlist(['a', 'b', 'c'], 1)).toEqual({ promoted: ['a'], rest: ['b', 'c'] })
    expect(promoteFromWaitlist(['a'], 0)).toEqual({ promoted: [], rest: ['a'] })
  })
})

describe('абонемент', () => {
  it('списание уменьшает остаток, безлимит не списывается', () => {
    expect(chargeVisit(mem()).visitsLeft).toBe(7)
    expect(chargeVisit(mem({ visitsLeft: null })).visitsLeft).toBeNull()
  })
  it('возврат не превышает общего числа', () => {
    expect(refundVisit(mem({ visitsLeft: 7 })).visitsLeft).toBe(8)
    expect(refundVisit(mem({ visitsLeft: 8 })).visitsLeft).toBe(8)
  })
  it('нет абонемента / закончились занятия / утренний вечером', () => {
    const start = NOW + 5 * HOUR
    expect(checkMembership(null, start, NOW)).toEqual({ ok: false, reason: 'no-membership' })
    expect(checkMembership(mem({ visitsLeft: 0 }), start, NOW).ok).toBe(false)
    expect(checkMembership(mem({ morningOnly: true, visitsLeft: null }), at(19), NOW).ok).toBe(false)
    expect(checkMembership(mem({ morningOnly: true, visitsLeft: null }), at(9) + 24 * HOUR, NOW).ok).toBe(true)
  })
  it('срок действия проверяется на дату занятия', () => {
    expect(checkMembership(mem({ expiresAt: NOW + HOUR }), NOW + 2 * HOUR, NOW).ok).toBe(false)
  })
  it('заморозка сдвигает срок, разморозка возвращает неиспользованные дни', () => {
    const f = freezeMembership(mem(), NOW, 7)!
    expect(f.expiresAt).toBe(mem().expiresAt + 7 * 24 * HOUR)
    expect(f.freezeDaysLeft).toBe(7)
    expect(checkMembership(f, NOW + 2 * HOUR, NOW).ok).toBe(false)
    const u = unfreezeMembership(f, NOW + 2 * 24 * HOUR)!
    expect(u.frozenUntil).toBeNull()
    expect(u.freezeDaysLeft).toBe(12)
  })
  it('закончившийся абонемент заморозить нельзя', () => {
    expect(freezeMembership(mem({ expiresAt: NOW - HOUR }), NOW, 7)).toBeNull()
  })
})

describe('лист ожидания и пересечения', () => {
  const booked = { ...empty, bookings: [{ ...cls('b', at(14)), charged: true }] }
  it('в лист ожидания нельзя, если пересекается с записью', () => {
    const r = decideBooking(booked, cls('w', at(14, 30)), 0, NOW)
    expect(r).toEqual({ ok: false, reason: 'Нельзя встать в лист ожидания: у вас уже есть запись на занятие в это время.' })
  })
  it('без пересечения в лист ожидания можно', () => expect(decideBooking(booked, cls('w', at(15)), 0, NOW)).toEqual({ ok: true, action: 'waitlist' }))
})

describe('decideBooking', () => {
  const c = cls('c1', NOW + 5 * HOUR)
  it('есть место -> запись', () => expect(decideBooking(empty, c, 3, NOW)).toEqual({ ok: true, action: 'book' }))
  it('мест нет -> лист ожидания', () => expect(decideBooking(empty, c, 0, NOW)).toEqual({ ok: true, action: 'waitlist' }))
  it('меньше 30 минут -> отказ', () => expect(decideBooking(empty, cls('c2', NOW + 20 * MIN), 3, NOW).ok).toBe(false))
  it('пересечение -> отказ', () => {
    const state = { ...empty, bookings: [{ ...cls('x', NOW + 5 * HOUR + 30 * MIN), charged: true }] }
    expect(decideBooking(state, c, 3, NOW).ok).toBe(false)
  })
  it('дубль -> отказ', () => {
    const state = { ...empty, bookings: [{ ...c, charged: true }] }
    expect(decideBooking(state, c, 3, NOW).ok).toBe(false)
  })
  it('без абонемента -> no-membership', () => {
    expect(decideBooking({ ...empty, membership: null }, c, 3, NOW)).toEqual({ ok: false, reason: 'no-membership' })
  })
})
