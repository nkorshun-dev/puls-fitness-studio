// Бизнес-правила записи. Только чистые функции: время (now) всегда передаётся аргументом.
import { DAY, HOUR, MIN } from './dates'
import { minskDate } from './time'
import type { AccountState, ClassRef, UserMembership } from './types'

/** Менять здесь: записаться можно не позже чем за N минут до начала. */
export const BOOKING_CLOSE_MIN = 30
/** Менять здесь: бесплатная отмена не позже чем за N часов до начала. */
export const FREE_CANCEL_HOURS = 3

type Span = { start: number; end: number }

export const canBook = (now: number, start: number) => start - now >= BOOKING_CLOSE_MIN * MIN

export type CancelPolicy = 'free' | 'late' | 'started'
export function cancelPolicy(now: number, start: number): CancelPolicy {
  if (now >= start) return 'started'
  return start - now >= FREE_CANCEL_HOURS * HOUR ? 'free' : 'late'
}

/** Занятия пересекаются, если каждое началось раньше, чем закончилось другое. */
export const overlaps = (a: Span, b: Span) => a.start < b.end && b.start < a.end

export const findConflict = <T extends Span>(candidate: Span, existing: T[]): T | undefined =>
  existing.find((e) => overlaps(candidate, e))

export const seatsLeft = (capacity: number, booked: number) => Math.max(0, capacity - booked)

/** Номер в очереди по числу людей впереди. */
export const waitlistPosition = (ahead: number) => ahead + 1

/** Освободилось одно место: если перед вами никого — вы получаете его, иначе очередь сдвигается. */
export function releaseSeat(ahead: number): { promoted: boolean; ahead: number } {
  return ahead <= 0 ? { promoted: true, ahead: 0 } : { promoted: false, ahead: ahead - 1 }
}

/** Общий вариант: освободилось N мест — их получают первые N из очереди. */
export function promoteFromWaitlist<T>(queue: T[], freeSeats: number): { promoted: T[]; rest: T[] } {
  const n = Math.max(0, freeSeats)
  return { promoted: queue.slice(0, n), rest: queue.slice(n) }
}

// ---- абонемент ----

const isMorning = (start: number) => minskDate(start).getUTCHours() < 12

export function isFrozen(m: UserMembership, now: number) {
  return m.frozenUntil !== null && m.frozenUntil > now
}

export type MembershipCheck = { ok: true } | { ok: false; reason: string }

export function checkMembership(m: UserMembership | null, start: number, now: number): MembershipCheck {
  if (!m) return { ok: false, reason: 'no-membership' }
  if (isFrozen(m, now)) return { ok: false, reason: 'Абонемент заморожен. Разморозьте его в личном кабинете.' }
  if (m.expiresAt < start) return { ok: false, reason: 'Абонемент закончится раньше этого занятия.' }
  if (m.visitsLeft !== null && m.visitsLeft <= 0) return { ok: false, reason: 'На абонементе не осталось занятий.' }
  if (m.morningOnly && !isMorning(start)) return { ok: false, reason: 'Утренний безлимит действует на занятия до 12:00.' }
  return { ok: true }
}

/** Списание одного занятия (безлимит не списывается). */
export const chargeVisit = (m: UserMembership): UserMembership =>
  m.visitsLeft === null ? m : { ...m, visitsLeft: m.visitsLeft - 1 }

export const refundVisit = (m: UserMembership): UserMembership =>
  m.visitsLeft === null ? m : { ...m, visitsLeft: Math.min(m.visitsTotal ?? m.visitsLeft + 1, m.visitsLeft + 1) }

/** Заморозка: срок абонемента сдвигается на число дней заморозки. */
export function freezeMembership(m: UserMembership, now: number, days: number): UserMembership | null {
  const d = Math.min(days, m.freezeDaysLeft)
  if (d <= 0 || isFrozen(m, now) || m.expiresAt <= now) return null
  return { ...m, frozenUntil: now + d * DAY, expiresAt: m.expiresAt + d * DAY, freezeDaysLeft: m.freezeDaysLeft - d }
}

export function unfreezeMembership(m: UserMembership, now: number): UserMembership | null {
  if (!isFrozen(m, now)) return null
  const unusedDays = Math.floor((m.frozenUntil! - now) / DAY)
  return { ...m, frozenUntil: null, expiresAt: m.expiresAt - unusedDays * DAY, freezeDaysLeft: m.freezeDaysLeft + unusedDays }
}

// ---- решение о записи ----

export type BookDecision =
  | { ok: true; action: 'book' | 'waitlist' }
  | { ok: false; reason: string }

/**
 * Можно ли записаться на занятие и что произойдёт: запись или лист ожидания.
 * freeSeats — свободные места без учёта вашей записи.
 */
export function decideBooking(
  state: Pick<AccountState, 'membership' | 'bookings' | 'waitlist'>,
  cls: ClassRef,
  freeSeats: number,
  now: number,
): BookDecision {
  if (state.bookings.some((b) => b.classId === cls.classId)) return { ok: false, reason: 'Вы уже записаны на это занятие.' }
  if (state.waitlist.some((w) => w.classId === cls.classId)) return { ok: false, reason: 'Вы уже в листе ожидания.' }
  if (!canBook(now, cls.start)) return { ok: false, reason: `Запись закрывается за ${BOOKING_CLOSE_MIN} минут до начала.` }
  const clash = findConflict(cls, state.bookings)
  if (clash) return { ok: false, reason: freeSeats > 0 ? 'У вас уже есть запись на это время.' : 'Нельзя встать в лист ожидания: у вас уже есть запись на занятие в это время.' }
  const m = checkMembership(state.membership, cls.start, now)
  if (!m.ok) return { ok: false, reason: m.reason }
  return { ok: true, action: freeSeats > 0 ? 'book' : 'waitlist' }
}
