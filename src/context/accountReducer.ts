import { planById } from '../data/memberships'
import { DAY, formatDateTime } from '../lib/dates'
import {
  cancelPolicy, canBook, chargeVisit, checkMembership, decideBooking, findConflict, freezeMembership,
  refundVisit, releaseSeat, unfreezeMembership, waitlistPosition,
} from '../lib/rules'
import { getWeek } from '../lib/schedule'
import { minskDate } from '../lib/time'
import type { AccountState, ClassRef, HistoryItem, Result, UserMembership } from '../lib/types'
import { directionBySlug } from '../data/directions'

export const initialState: AccountState = {
  user: null, membership: null, bookings: [], waitlist: [], history: [], trialUsed: false,
}

export type Action =
  | { type: 'LOGIN'; name: string; phone: string; now: number }
  | { type: 'LOGOUT' }
  | { type: 'RESET' }
  | { type: 'BUY'; planId: string; now: number }
  | { type: 'BOOK'; cls: ClassRef; free: number; now: number }
  | { type: 'WAIT'; cls: ClassRef; free: number; ahead: number; now: number }
  | { type: 'CANCEL'; classId: string; now: number }
  | { type: 'LEAVE_WAIT'; classId: string }
  | { type: 'RELEASE'; classId: string; now: number }
  | { type: 'FREEZE'; now: number }
  | { type: 'UNFREEZE'; now: number }
  | { type: 'SYNC'; now: number }

const ok = (message: string): Result => ({ ok: true, message })
const fail = (message: string): Result => ({ ok: false, message })
const out = (state: AccountState, result: Result) => ({ state, result })
const ref = ({ classId, start, end, direction, trainer, hall }: ClassRef): ClassRef => ({ classId, start, end, direction, trainer, hall })
const title = (c: ClassRef) => `${directionBySlug(c.direction)?.name ?? 'Занятие'}, ${formatDateTime(c.start)}`

/** Демо-история: несколько занятий прошлой недели, чтобы кабинет не был пустым. */
function seedHistory(now: number): HistoryItem[] {
  const wanted = ['mon-1900-pilates', 'wed-1900-pilates', 'thu-0800-yoga', 'fri-1800-yoga', 'sat-1000-func']
  return getWeek(-1, minskDate(now))
    .filter((c) => wanted.includes(c.templateId) && !c.cancelReason)
    .map((c) => ({ classId: c.id, start: c.start, direction: c.direction, trainer: c.trainer }))
    .sort((a, b) => b.start - a.start)
}

function book(state: AccountState, cls: ClassRef, free: number, now: number, waitAhead: number | null): { state: AccountState; result: Result } {
  if (!state.user) return out(state, fail('Сначала войдите в личный кабинет.'))
  const d = decideBooking(state, cls, free, now)
  if (!d.ok) {
    return out(state, fail(d.reason === 'no-membership' ? 'Нужен абонемент или пробное занятие.' : d.reason))
  }
  if (waitAhead === null) {
    if (d.action === 'waitlist') return out(state, fail('Мест нет. Встаньте в лист ожидания.'))
    const m = state.membership as UserMembership
    return out(
      {
        ...state,
        membership: chargeVisit(m),
        bookings: [...state.bookings, { ...ref(cls), charged: m.visitsLeft !== null }].sort((a, b) => a.start - b.start),
      },
      ok(`Вы записаны: ${title(cls)}.`),
    )
  }
  if (d.action === 'book') return out(state, fail('Есть свободные места. Запишитесь на занятие.'))
  const entry = { ...ref(cls), ahead: waitAhead }
  return out(
    { ...state, waitlist: [...state.waitlist, entry] },
    ok(`Вы в листе ожидания, ваш номер в очереди: ${waitlistPosition(waitAhead)}.`),
  )
}

export function transition(state: AccountState, a: Action): { state: AccountState; result: Result } {
  switch (a.type) {
    case 'LOGIN':
      return out(
        { ...state, user: { name: a.name.trim(), phone: a.phone }, history: state.history.length ? state.history : seedHistory(a.now) },
        ok(`Здравствуйте, ${a.name.trim()}!`),
      )
    case 'LOGOUT':
      return out({ ...state, user: null }, ok('Вы вышли из кабинета.'))
    case 'RESET':
      return out(initialState, ok('Демо-данные сброшены.'))
    case 'BUY': {
      if (!state.user) return out(state, fail('Сначала войдите в личный кабинет.'))
      const plan = planById(a.planId)
      if (!plan) return out(state, fail('Абонемент не найден.'))
      if (plan.kind === 'trial' && state.trialUsed) return out(state, fail('Пробное занятие доступно один раз.'))
      const membership: UserMembership = {
        planId: plan.id, name: plan.name, activatedAt: a.now, expiresAt: a.now + plan.days * DAY,
        visitsLeft: plan.visits, visitsTotal: plan.visits, morningOnly: Boolean(plan.morningOnly),
        frozenUntil: null, freezeDaysLeft: plan.freezeDays,
      }
      return out(
        { ...state, membership, trialUsed: state.trialUsed || plan.kind === 'trial' },
        ok(`Активирован: ${plan.name} (демо, оплата не выполняется).`),
      )
    }
    case 'BOOK':
      return book(state, a.cls, a.free, a.now, null)
    case 'WAIT':
      return book(state, a.cls, a.free, a.now, a.ahead)
    case 'CANCEL': {
      const b = state.bookings.find((x) => x.classId === a.classId)
      if (!b) return out(state, fail('Запись не найдена.'))
      const policy = cancelPolicy(a.now, b.start)
      if (policy === 'started') return out(state, fail('Занятие уже началось, отменить нельзя.'))
      const rest = state.bookings.filter((x) => x !== b)
      const m = state.membership
      if (policy === 'free') {
        return out(
          { ...state, bookings: rest, membership: m && b.charged ? refundVisit(m) : m },
          ok('Запись отменена, занятие вернулось на абонемент.'),
        )
      }
      return out({ ...state, bookings: rest }, ok(b.charged ? 'Запись отменена. До начала меньше 3 часов, занятие списано.' : 'Запись отменена.'))
    }
    case 'LEAVE_WAIT':
      return out({ ...state, waitlist: state.waitlist.filter((w) => w.classId !== a.classId) }, ok('Вы вышли из листа ожидания.'))
    case 'RELEASE': {
      const w = state.waitlist.find((x) => x.classId === a.classId)
      if (!w) return out(state, fail('Вы не в листе ожидания этого занятия.'))
      const r = releaseSeat(w.ahead)
      if (!r.promoted) {
        return out(
          { ...state, waitlist: state.waitlist.map((x) => (x === w ? { ...x, ahead: r.ahead } : x)) },
          ok(`Кто-то отменил запись. Ваш номер в очереди: ${waitlistPosition(r.ahead)}.`),
        )
      }
      const without = { ...state, waitlist: state.waitlist.filter((x) => x !== w) }
      const mc = checkMembership(state.membership, w.start, a.now)
      if (!canBook(a.now, w.start) || findConflict(w, state.bookings) || !mc.ok || !state.membership) {
        return out(without, fail('Место освободилось, но записать вас не удалось: проверьте время и абонемент.'))
      }
      return out(
        {
          ...without,
          membership: chargeVisit(state.membership),
          bookings: [...state.bookings, { ...ref(w), charged: state.membership.visitsLeft !== null }].sort((x, y) => x.start - y.start),
        },
        ok(`Освободилось место. Вы записаны: ${title(w)}.`),
      )
    }
    case 'FREEZE': {
      const m = state.membership && freezeMembership(state.membership, a.now, 7)
      return m ? out({ ...state, membership: m }, ok('Абонемент заморожен на 7 дней (демо).')) : out(state, fail('Заморозка недоступна для этого абонемента.'))
    }
    case 'UNFREEZE': {
      const m = state.membership && unfreezeMembership(state.membership, a.now)
      return m ? out({ ...state, membership: m }, ok('Абонемент разморожен.')) : out(state, fail('Абонемент не заморожен.'))
    }
    case 'SYNC': {
      const done = state.bookings.filter((b) => b.end <= a.now)
      const staleWait = state.waitlist.some((w) => w.start <= a.now)
      if (!done.length && !staleWait) return out(state, ok(''))
      const history: HistoryItem[] = [
        ...done.map((b) => ({ classId: b.classId, start: b.start, direction: b.direction, trainer: b.trainer })),
        ...state.history,
      ]
      return out(
        {
          ...state, history,
          bookings: state.bookings.filter((b) => b.end > a.now),
          waitlist: state.waitlist.filter((w) => w.start > a.now),
        },
        ok(''),
      )
    }
  }
}

export const reducer = (state: AccountState, a: Action) => transition(state, a).state
