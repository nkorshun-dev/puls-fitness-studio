import { addDays, isSameDay, toISODate, weekdayShort } from '../lib/dates'
import { minskDate } from '../lib/time'
import type { ClassItem } from '../lib/types'
import { ClassCard } from './ClassCard'
import s from './ScheduleGrid.module.css'

interface Props {
  classes: ClassItem[]
  weekStart: Date
  now: number
  onOpen: (c: ClassItem) => void
}

/** Десктоп: неделя колонками по дням. */
export function ScheduleGrid({ classes, weekStart, now, onOpen }: Props) {
  return (
    <div className={s.grid}>
      {weekdayShort.map((label, i) => {
        const day = addDays(weekStart, i)
        const iso = toISODate(day)
        const items = classes.filter((c) => c.date === iso)
        const today = isSameDay(day, minskDate(now))
        return (
          <section key={iso} className={s.col} aria-label={`${label}, ${day.getUTCDate()}`}>
            <h3 className={`${s.head} ${today ? s.today : ''}`}>
              <span>{label}</span> <span className={s.num}>{day.getUTCDate()}</span>
            </h3>
            <div className={s.list}>
              {items.length ? items.map((c) => <ClassCard key={c.id} cls={c} onOpen={onOpen} compact />) : <p className={s.empty}>Нет занятий</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
