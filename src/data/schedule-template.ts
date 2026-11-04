export type Level = 'beginner' | 'all' | 'advanced'

export const levelLabels: Record<Level, string> = {
  beginner: 'Новички',
  all: 'Все уровни',
  advanced: 'Продвинутые',
}

export interface TemplateClass {
  id: string
  day: number // 0 = пн … 6 = вс
  time: string // HH:MM
  direction: string
  trainer: string
  hall: string
  duration: number
  capacity: number
  level: Level
}

// id, день, время, направление, тренер, зал, минуты, уровень
type Row = [string, number, string, string, string, string, number, Level]
const rows: Row[] = [
  ['mon-0700-cycle', 0, '07:00', 'cycle', 'maxim-p', 'cycle', 50, 'all'],
  ['mon-0800-yoga', 0, '08:00', 'yoga', 'marina-l', 'small', 60, 'beginner'],
  ['mon-1230-func', 0, '12:30', 'functional', 'dmitry-s', 'main', 45, 'all'],
  ['mon-1800-trx', 0, '18:00', 'trx', 'ivan-t', 'main', 55, 'all'],
  ['mon-1900-pilates', 0, '19:00', 'pilates', 'anna-k', 'small', 55, 'all'],
  ['mon-2030-stretch', 0, '20:30', 'stretching', 'elena-v', 'small', 50, 'beginner'],
  ['tue-0700-func', 1, '07:00', 'functional', 'dmitry-s', 'main', 50, 'advanced'],
  ['tue-0900-back', 1, '09:00', 'back', 'ivan-t', 'small', 55, 'beginner'],
  ['tue-1300-pilates', 1, '13:00', 'pilates', 'marina-l', 'small', 50, 'beginner'],
  ['tue-1800-cycle', 1, '18:00', 'cycle', 'maxim-p', 'cycle', 50, 'all'],
  ['tue-1930-zumba', 1, '19:30', 'zumba', 'olga-m', 'main', 55, 'all'],
  ['tue-2100-yoga', 1, '21:00', 'yoga', 'elena-v', 'small', 60, 'all'],
  ['wed-0730-pilates', 2, '07:30', 'pilates', 'anna-k', 'small', 55, 'all'],
  ['wed-0900-trx', 2, '09:00', 'trx', 'dmitry-s', 'main', 50, 'all'],
  ['wed-1230-stretch', 2, '12:30', 'stretching', 'olga-m', 'small', 45, 'beginner'],
  ['wed-1800-func', 2, '18:00', 'functional', 'dmitry-s', 'main', 55, 'all'],
  ['wed-1900-pilates', 2, '19:00', 'pilates', 'anna-k', 'small', 55, 'advanced'],
  ['wed-2000-cycle', 2, '20:00', 'cycle', 'maxim-p', 'cycle', 45, 'advanced'],
  ['thu-0700-cycle', 3, '07:00', 'cycle', 'maxim-p', 'cycle', 50, 'all'],
  ['thu-0800-yoga', 3, '08:00', 'yoga', 'elena-v', 'small', 60, 'all'],
  ['thu-1300-back', 3, '13:00', 'back', 'anna-k', 'small', 50, 'beginner'],
  ['thu-1800-zumba', 3, '18:00', 'zumba', 'marina-l', 'main', 55, 'beginner'],
  ['thu-1930-trx', 3, '19:30', 'trx', 'ivan-t', 'main', 50, 'advanced'],
  ['thu-2100-stretch', 3, '21:00', 'stretching', 'elena-v', 'small', 45, 'all'],
  ['fri-0800-func', 4, '08:00', 'functional', 'dmitry-s', 'main', 50, 'all'],
  ['fri-0900-pilates', 4, '09:00', 'pilates', 'marina-l', 'small', 55, 'beginner'],
  ['fri-1230-cycle', 4, '12:30', 'cycle', 'maxim-p', 'cycle', 45, 'all'],
  ['fri-1800-yoga', 4, '18:00', 'yoga', 'elena-v', 'small', 60, 'all'],
  ['fri-1900-zumba', 4, '19:00', 'zumba', 'olga-m', 'main', 55, 'all'],
  ['fri-2030-back', 4, '20:30', 'back', 'ivan-t', 'small', 50, 'all'],
  ['sat-1000-func', 5, '10:00', 'functional', 'dmitry-s', 'main', 55, 'all'],
  ['sat-1100-yoga', 5, '11:00', 'yoga', 'marina-l', 'small', 60, 'beginner'],
  ['sat-1130-cycle', 5, '11:30', 'cycle', 'maxim-p', 'cycle', 50, 'all'],
  ['sat-1230-zumba', 5, '12:30', 'zumba', 'olga-m', 'main', 55, 'all'],
  ['sat-1400-pilates', 5, '14:00', 'pilates', 'anna-k', 'small', 55, 'all'],
  ['sun-1000-yoga', 6, '10:00', 'yoga', 'elena-v', 'small', 70, 'all'],
  ['sun-1100-trx', 6, '11:00', 'trx', 'ivan-t', 'main', 50, 'beginner'],
  ['sun-1200-stretch', 6, '12:00', 'stretching', 'elena-v', 'small', 50, 'all'],
  ['sun-1300-back', 6, '13:00', 'back', 'anna-k', 'small', 50, 'beginner'],
  ['sun-1400-cycle', 6, '14:00', 'cycle', 'maxim-p', 'cycle', 50, 'all'],
]

const capacityByHall: Record<string, number> = { main: 20, small: 14, cycle: 8 }

export const scheduleTemplate: TemplateClass[] = rows.map(
  ([id, day, time, direction, trainer, hall, duration, level]) => ({
    id, day, time, direction, trainer, hall, duration, level, capacity: capacityByHall[hall],
  }),
)

/** Исключения: weekOffset — неделя от текущей (0..2). */
export interface ScheduleException {
  weekOffset: number
  templateId: string
  trainer?: string // замена тренера
  cancelReason?: string
}
export const scheduleExceptions: ScheduleException[] = [
  { weekOffset: 0, templateId: 'wed-1800-func', trainer: 'ivan-t' },
  { weekOffset: 1, templateId: 'tue-0700-func', cancelReason: 'Тренер на соревнованиях' },
  { weekOffset: 1, templateId: 'fri-1900-zumba', trainer: 'marina-l' },
  { weekOffset: 2, templateId: 'thu-1300-back', cancelReason: 'Технические работы в зале' },
]

/** Праздники (месяц-день): занятия отменяются. */
export const holidays: Record<string, string> = {
  '01-01': 'Новый год', '01-07': 'Рождество', '03-08': 'Международный женский день',
  '05-01': 'Праздник труда', '05-09': 'День Победы', '07-03': 'День Независимости',
  '11-07': 'День Октябрьской революции', '12-25': 'Католическое Рождество',
}
