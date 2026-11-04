import { createContext, useContext } from 'react'
import type { AccountState, ClassItem, Result } from '../lib/types'

export interface AccountApi {
  state: AccountState
  /** Текущее время; обновляется раз в 30 секунд. */
  now: number
  login: (name: string, phone: string) => Result
  logout: () => void
  reset: () => void
  buy: (planId: string) => Result
  book: (cls: ClassItem) => Result
  joinWaitlist: (cls: ClassItem) => Result
  cancel: (classId: string) => Result
  leaveWaitlist: (classId: string) => Result
  simulateRelease: (classId: string) => Result
  freeze: () => Result
  unfreeze: () => Result
}

export const AccountContext = createContext<AccountApi | null>(null)

export function useAccount(): AccountApi {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount вне AccountProvider')
  return ctx
}
