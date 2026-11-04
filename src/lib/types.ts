import type { Level } from '../data/schedule-template'

export interface ClassItem {
  id: string // `${date}|${templateId}`
  date: string
  templateId: string
  start: number
  end: number
  direction: string
  trainer: string
  hall: string
  level: Level
  capacity: number
  booked: number // занято другими клиентами (без вас)
  waitlistBase: number // сколько людей уже в очереди (если мест нет)
  cancelReason?: string
  substituted?: boolean
}

export interface ClassRef {
  classId: string
  start: number
  end: number
  direction: string
  trainer: string
  hall: string
}

export interface Booking extends ClassRef {
  charged: boolean // занятие списано с абонемента
}

export interface WaitlistEntry extends ClassRef {
  ahead: number // сколько человек перед вами
}

export interface HistoryItem {
  classId: string
  start: number
  direction: string
  trainer: string
}

export interface UserMembership {
  planId: string
  name: string
  activatedAt: number
  expiresAt: number
  visitsLeft: number | null // null = безлимит
  visitsTotal: number | null
  morningOnly: boolean
  frozenUntil: number | null
  freezeDaysLeft: number
}

export interface AccountState {
  user: { name: string; phone: string } | null
  membership: UserMembership | null
  bookings: Booking[]
  waitlist: WaitlistEntry[]
  history: HistoryItem[]
  trialUsed: boolean
}

export interface Result {
  ok: boolean
  message: string
}
