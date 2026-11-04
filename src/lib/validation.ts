import { isPhoneComplete } from './phone-mask'

export const validateName = (name: string) => {
  const v = name.trim()
  if (v.length < 2) return 'Введите имя, минимум 2 буквы'
  if (v.length > 40) return 'Слишком длинное имя'
  if (!/^[\p{L}\s'-]+$/u.test(v)) return 'Имя может содержать только буквы'
  return ''
}

export const validatePhone = (phone: string) =>
  isPhoneComplete(phone) ? '' : 'Введите номер полностью: +375 (XX) XXX-XX-XX'

export interface TrialValues {
  name: string
  phone: string
  direction: string
  time: string
  consent: boolean
}
export type TrialErrors = Partial<Record<keyof TrialValues, string>>

export const validateTrial = (v: TrialValues): TrialErrors => {
  const e: TrialErrors = {}
  const n = validateName(v.name)
  if (n) e.name = n
  const p = validatePhone(v.phone)
  if (p) e.phone = p
  if (!v.direction) e.direction = 'Выберите направление'
  if (!v.time) e.time = 'Выберите удобное время'
  if (!v.consent) e.consent = 'Нужно согласие на обработку данных'
  return e
}
