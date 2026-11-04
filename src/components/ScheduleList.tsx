import { useState, type KeyboardEvent } from 'react'
import { addDays, isSameDay, toISODate, weekdayLong, weekdayShort, formatDayMonth } from '../lib/dates'
import { minskDate } from '../lib/time'
import type { ClassItem } from '../lib/types'
import { ClassCard } from './ClassCard'
import s from './ScheduleList.module.css'

interface Props {
  classes: ClassItem[]
  weekStart: Date
  now: number
  onOpen: (c: ClassItem) => void
}

/** Мобильный вид: вкладки дней и список занятий выбранного дня. */
export function ScheduleList({ classes, weekStart, now, onOpen }: Props) {
  const todayIdx = Array.from({ length: 7 }, (_, i) => i).find((i) => isSameDay(addDays(weekStart, i), minskDate(now)))
  const [picked, setPicked] = useState<number | null>(null)
  const day = picked ?? todayIdx ?? 0
  const iso = toISODate(addDays(weekStart, day))
  const items = classes.filter((c) => c.date === iso)

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (day + d + 7) % 7
    setPicked(next)
    document.getElementById(`day-tab-${next}`)?.focus()
  }

  return (
    <div>
      <div className={s.tabs} role="tablist" aria-label="Дни недели" onKeyDown={onKey}>
        {weekdayShort.map((label, i) => {
          const d = addDays(weekStart, i)
          return (
            <button
              key={label}
              id={`day-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === day}
              aria-controls="day-panel"
              tabIndex={i === day ? 0 : -1}
              className={`${s.tab} ${i === day ? s.active : ''} ${i === todayIdx ? s.today : ''}`}
              onClick={() => setPicked(i)}
            >
              <span>{label}</span>
              <strong>{d.getUTCDate()}</strong>
            </button>
          )
        })}
      </div>
      <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className={s.panel}>
        <h3 className={s.title}>{weekdayLong[day]}, {formatDayMonth(addDays(weekStart, day))}</h3>
        {items.length ? items.map((c) => <ClassCard key={c.id} cls={c} onOpen={onOpen} />) : <p className={s.empty}>В этот день занятий по выбранным фильтрам нет.</p>}
      </div>
    </div>
  )
}
