import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClassModal } from '../components/ClassModal'
import { Filters } from '../components/Filters'
import { ScheduleGrid } from '../components/ScheduleGrid'
import { ScheduleList } from '../components/ScheduleList'
import { WeekSwitcher } from '../components/WeekSwitcher'
import { useAccount } from '../context/account-context'
import { classView } from '../lib/class-view'
import { addDays, startOfWeek } from '../lib/dates'
import { minskDate } from '../lib/time'
import { matches, parseFilters, parseWeek, toParams, type Filters as F } from '../lib/filters'
import { plural } from '../lib/format'
import { getWeek, WEEKS_AHEAD } from '../lib/schedule'
import { usePageMeta } from '../lib/seo'
import type { ClassItem } from '../lib/types'
import { useMedia } from '../lib/use-media'
import s from './Schedule.module.css'

export default function Schedule() {
  usePageMeta('Расписание занятий', 'Расписание групповых тренировок студии «Пульс» на 3 недели: фильтры по направлению, тренеру, уровню и времени, онлайн-запись.')
  const [params, setParams] = useSearchParams()
  const { state, now } = useAccount()
  const [open, setOpen] = useState<ClassItem | null>(null)
  const [nonce, setNonce] = useState(0)
  const desktop = useMedia('(min-width: 1024px)')

  const filters = parseFilters(params)
  const week = parseWeek(params)
  const weekStart = addDays(startOfWeek(minskDate(now)), week * 7)
  const all = getWeek(week, minskDate(now))
  const shown = all.filter((c) => matches(c, filters, classView(c, state, now).left))

  const update = (f: F, w: number) => setParams(toParams(f, w), { replace: true })
  const common = { classes: shown, weekStart, now, onOpen: setOpen }

  return (
    <>
      <section className={`section dark ${s.head}`}>
        <div className="container">
          <h1>Расписание</h1>
          <p className="lead">Запись открыта на 3 недели вперёд и закрывается за 30 минут до начала. Отмена без списания — не позже чем за 3 часа.</p>
        </div>
      </section>
      <section className="section" style={{ paddingBlock: '28px 64px' }}>
        <div className="container">
          <div className={s.controls}>
            <WeekSwitcher week={week} weekStart={weekStart} max={WEEKS_AHEAD - 1} onChange={(w) => update(filters, w)} onToday={() => { update(filters, 0); setNonce(nonce + 1) }} />
            <Filters value={filters} onChange={(f) => update(f, week)} />
          </div>
          <p className={s.count} aria-live="polite">
            Найдено {shown.length} {plural(shown.length, ['занятие', 'занятия', 'занятий'])}
          </p>
          {shown.length === 0 && <p className={s.empty}>По таким фильтрам занятий нет. Попробуйте сбросить часть условий.</p>}
          {desktop ? <ScheduleGrid {...common} /> : <ScheduleList key={`${week}-${nonce}`} {...common} />}
        </div>
      </section>
      {open && <ClassModal cls={open} onClose={() => setOpen(null)} />}
    </>
  )
}
