export type PlanKind = 'trial' | 'single' | 'pack' | 'unlimited' | 'morning' | 'family'

export interface Plan {
  id: string
  kind: PlanKind
  name: string
  price: number
  visits: number | null // null = безлимит
  days: number
  freezeDays: number
  perVisit: number | null
  morningOnly?: boolean
  popular?: boolean
  note: string
}

export const plans: Plan[] = [
  { id: 'trial', kind: 'trial', name: 'Пробное занятие', price: 9, visits: 1, days: 7, freezeDays: 0, perVisit: 9, note: 'Один раз для новых клиентов. Любое направление.' },
  { id: 'single', kind: 'single', name: 'Разовое', price: 19, visits: 1, days: 7, freezeDays: 0, perVisit: 19, note: 'Одно занятие в течение недели.' },
  { id: 'pack4', kind: 'pack', name: '4 занятия', price: 69, visits: 4, days: 30, freezeDays: 0, perVisit: 17.25, note: 'Для спокойного старта: раз в неделю.' },
  { id: 'pack8', kind: 'pack', name: '8 занятий', price: 118, visits: 8, days: 45, freezeDays: 14, perVisit: 14.75, popular: true, note: 'Чаще всего берут на 2 занятия в неделю.' },
  { id: 'pack12', kind: 'pack', name: '12 занятий', price: 156, visits: 12, days: 60, freezeDays: 14, perVisit: 13, note: 'Три занятия в неделю по минимальной цене.' },
  { id: 'unlimited', kind: 'unlimited', name: 'Безлимит на месяц', price: 164, visits: null, days: 30, freezeDays: 14, perVisit: null, popular: true, note: 'Ходите сколько хотите, 30 дней со дня активации.' },
  { id: 'morning', kind: 'morning', name: 'Утренний безлимит', price: 97, visits: null, days: 30, freezeDays: 7, perVisit: null, morningOnly: true, note: 'Все занятия, которые начинаются до 12:00.' },
  { id: 'family', kind: 'family', name: 'Семейный (2 человека)', price: 279, visits: null, days: 30, freezeDays: 14, perVisit: null, note: 'Безлимит для двоих. В демо активируется на ваш профиль.' },
]
export const planById = (id: string) => plans.find((p) => p.id === id)

export const promos = [
  { title: 'Приведи друга', text: 'Друг покупает абонемент на 8 занятий, вам плюс одно занятие в подарок.' },
  { title: 'Студентам -10%', text: 'При предъявлении студенческого билета на любые абонементы от 4 занятий.' },
  { title: 'Пробное за 9 BYN', text: 'Одно занятие на любом направлении, если вы ещё не занимались в «Пульсе».' },
]
