import { canBook, seatsLeft } from './rules'
import type { AccountState, ClassItem, ClassRef } from './types'

export const toRef = (c: ClassItem): ClassRef => ({
  classId: c.id, start: c.start, end: c.end, direction: c.direction, trainer: c.trainer, hall: c.hall,
})

export type ClassStatus = 'cancelled' | 'past' | 'booked' | 'waitlist' | 'full' | 'closed' | 'open'

export interface ClassView {
  status: ClassStatus
  left: number // свободных мест с учётом вашей записи
  waitPos: number | null
  label: string
}

/** Что показывать на карточке занятия: статус, места, номер в очереди. */
export function classView(c: ClassItem, s: AccountState, now: number): ClassView {
  const mine = Boolean(s.user) && s.bookings.some((b) => b.classId === c.id)
  const wl = s.user ? s.waitlist.find((w) => w.classId === c.id) : undefined
  const left = seatsLeft(c.capacity, c.booked + (mine ? 1 : 0))
  const waitPos = wl ? wl.ahead + 1 : null
  let status: ClassStatus = 'open'
  if (c.cancelReason) status = 'cancelled'
  else if (c.end <= now) status = 'past'
  else if (mine) status = 'booked'
  else if (wl) status = 'waitlist'
  else if (!canBook(now, c.start)) status = 'closed'
  else if (left === 0) status = 'full'
  const labels: Record<ClassStatus, string> = {
    cancelled: 'отменено', past: 'прошло', booked: 'вы записаны', waitlist: `в листе ожидания №${waitPos}`,
    full: 'мест нет', closed: 'запись закрыта', open: '',
  }
  return { status, left, waitPos, label: labels[status] }
}
