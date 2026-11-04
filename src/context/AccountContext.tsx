import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { seatsLeft } from '../lib/rules'
import { toRef } from '../lib/class-view'
import type { AccountState, Result } from '../lib/types'
import { AccountContext, type AccountApi } from './account-context'
import { initialState, reducer, transition, type Action } from './accountReducer'
import { useToast } from './toast-context'

const KEY = 'account'
const obj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null
const num = (x: unknown) => typeof x === 'number' && Number.isFinite(x)
const str = (x: unknown) => typeof x === 'string'
const items = (x: unknown, ok: (o: Record<string, unknown>) => boolean) => Array.isArray(x) && x.every((i) => obj(i) && ok(i))
const hasRef = (o: Record<string, unknown>) => str(o.classId) && num(o.start) && str(o.direction) && str(o.trainer)

function isAccountState(x: unknown): x is AccountState {
  if (!obj(x)) return false
  const { user: u, membership: m } = x
  return (
    (u === null || (obj(u) && str(u.name) && str(u.phone))) &&
    (m === null || (obj(m) && str(m.planId) && str(m.name) && num(m.expiresAt) && num(m.freezeDaysLeft) && (m.frozenUntil === null || num(m.frozenUntil)) && (m.visitsLeft === null || num(m.visitsLeft)))) &&
    items(x.bookings, (o) => hasRef(o) && num(o.end) && str(o.hall)) &&
    items(x.waitlist, (o) => hasRef(o) && num(o.end) && str(o.hall) && num(o.ahead)) &&
    items(x.history, hasRef) &&
    typeof x.trialUsed === 'boolean'
  )
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadJSON(KEY, isAccountState) ?? initialState)
  const [now, setNow] = useState(() => Date.now())
  const toast = useToast()

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    dispatch({ type: 'SYNC', now })
  }, [now])

  useEffect(() => {
    saveJSON(KEY, state)
  }, [state])

  const act = useCallback(
    (a: Action): Result => {
      const { result } = transition(state, a)
      dispatch(a)
      if (result.message) toast.push(result.message, result.ok ? 'success' : 'error')
      return result
    },
    [state, toast],
  )

  const api = useMemo<AccountApi>(() => {
    const t = () => Date.now()
    return {
      state,
      now,
      login: (name, phone) => act({ type: 'LOGIN', name, phone, now: t() }),
      logout: () => void act({ type: 'LOGOUT' }),
      reset: () => void act({ type: 'RESET' }),
      buy: (planId) => act({ type: 'BUY', planId, now: t() }),
      book: (c) => act({ type: 'BOOK', cls: toRef(c), free: seatsLeft(c.capacity, c.booked), now: t() }),
      joinWaitlist: (c) =>
        act({ type: 'WAIT', cls: toRef(c), free: seatsLeft(c.capacity, c.booked), ahead: c.waitlistBase, now: t() }),
      cancel: (classId) => act({ type: 'CANCEL', classId, now: t() }),
      leaveWaitlist: (classId) => act({ type: 'LEAVE_WAIT', classId }),
      simulateRelease: (classId) => act({ type: 'RELEASE', classId, now: t() }),
      freeze: () => act({ type: 'FREEZE', now: t() }),
      unfreeze: () => act({ type: 'UNFREEZE', now: t() }),
    }
  }, [state, now, act])

  return <AccountContext.Provider value={api}>{children}</AccountContext.Provider>
}
