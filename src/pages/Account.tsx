import { useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { LoginForm } from '../components/LoginForm'
import { useAccount } from '../context/account-context'
import { directionBySlug } from '../data/directions'
import { hallById } from '../data/halls'
import { trainerBySlug } from '../data/trainers'
import { DAY, formatDateTime, formatFullDate, formatTime, weekdayShort, weekdayIndex } from '../lib/dates'
import { minskDate } from '../lib/time'
import { plural } from '../lib/format'
import { cancelPolicy, isFrozen } from '../lib/rules'
import { usePageMeta } from '../lib/seo'
import { visitStats } from '../lib/stats'
import type { Booking } from '../lib/types'
import s from './Account.module.css'
import p from './Page.module.css'

const monthsShort = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const HISTORY_PAGE = 5

const dirName = (slug: string) => directionBySlug(slug)?.name ?? 'Занятие'
const dirColor = (slug: string) => directionBySlug(slug)?.color ?? 'var(--accent)'
const trainerName = (slug: string) => trainerBySlug(slug)?.name ?? ''
const daysText = (n: number) => `${n} ${plural(n, ['день', 'дня', 'дней'])}`

/** Иконки статистики: один штрих 2px, 24×24. */
const icons: Record<string, ReactNode> = {
  month: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  total: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  fav: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  streak: <path d="M12 21c-3.9 0-7-2.7-7-6.5 0-3.3 2.3-5.4 4-7.5.4 1.8 1.3 3 2.5 3.5C11.5 7 13 4.5 15 3c.3 3 4 5.6 4 11 0 4-3.1 7-7 7Z" />,
}
const Icon = ({ name }: { name: keyof typeof icons }) => (
  <svg className={s.icon} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
)

export default function Account() {
  usePageMeta('Личный кабинет', 'Демо-кабинет клиента студии «Пульс»: абонемент, записи, лист ожидания и история посещений.')
  const acc = useAccount()
  const { state, now } = acc
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [historyShown, setHistoryShown] = useState(HISTORY_PAGE)

  if (!state.user) {
    return (
      <section className={`section dark ${p.head}`} style={{ minHeight: '60vh' }}>
        <div className="container">
          <h1>Личный кабинет</h1>
          <div className={s.demo} role="note">Демо-режим: данные хранятся только в вашем браузере</div>
          <div className={p.formBox}><LoginForm /></div>
        </div>
      </section>
    )
  }

  const m = state.membership
  const frozen = m ? isFrozen(m, now) : false
  const expired = m ? m.expiresAt < now : false
  const noVisits = m ? m.visitsLeft !== null && m.visitsLeft <= 0 : false
  const ended = expired || noVisits
  const visitsPct = m && m.visitsTotal ? Math.round(((m.visitsLeft ?? 0) / m.visitsTotal) * 100) : 100
  const totalDays = m ? Math.max(1, Math.round((m.expiresAt - m.activatedAt) / DAY)) : 1
  const daysLeft = m ? Math.max(0, Math.ceil((m.expiresAt - now) / DAY)) : 0
  const daysPct = Math.min(100, Math.round((daysLeft / totalDays) * 100))
  const stats = visitStats(state.history, now)
  const maxWeek = Math.max(1, ...stats.weekly.map((w) => w.count))

  const status = !m ? null
    : frozen ? <Badge tone="blue">Заморожен до {formatFullDate(m.frozenUntil!)}</Badge>
    : expired ? <Badge tone="amber">Срок истёк</Badge>
    : noVisits ? <Badge tone="amber">Занятия закончились</Badge>
    : <Badge tone="green">Активен</Badge>

  const dateTile = (start: number, direction: string) => {
    const d = minskDate(start)
    return (
      <div className={s.tile} style={{ '--dir': dirColor(direction) } as CSSProperties}>
        <b>{d.getUTCDate()}</b>
        <span>{monthsShort[d.getUTCMonth()]}</span>
      </div>
    )
  }

  const bookingActions = (b: Booking) => {
    const policy = cancelPolicy(now, b.start)
    if (policy === 'started') return <Badge tone="green">Идёт занятие</Badge>
    const late = policy === 'late'
    return (
      <>
        {late && <p className={s.warn}>До начала меньше 3 часов: при отмене занятие спишется.</p>}
        {confirmId === b.classId ? (
          <span className={s.row}>
            <button type="button" className="btn btn-sm" onClick={() => { acc.cancel(b.classId); setConfirmId(null) }}>Да, отменить</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Не отменять</button>
          </span>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => (late ? setConfirmId(b.classId) : acc.cancel(b.classId))}>Отменить</button>
        )}
      </>
    )
  }

  const membership = (
    <article className={`${s.panel} ${s.mem} dark`} aria-labelledby="a-mem">
      <div className={s.panelHead}>
        <h2 id="a-mem">Абонемент</h2>
        {status}
      </div>
      {m ? (
        <>
          <p className={s.memName}>{m.name}</p>
          <div className={s.memGrid}>
            <div className={s.memCell}>
              {m.visitsLeft === null ? (
                <p className={s.bigNum}>Безлимит</p>
              ) : (
                <>
                  <p className={s.bigNum}>{m.visitsLeft}<span>из {m.visitsTotal} · {plural(m.visitsLeft, ['занятие осталось', 'занятия осталось', 'занятий осталось'])}</span></p>
                  <div className={s.bar} role="progressbar" aria-label="Остаток занятий" aria-valuemin={0} aria-valuemax={m.visitsTotal ?? 0} aria-valuenow={m.visitsLeft}>
                    <i style={{ width: `${visitsPct}%` }} />
                  </div>
                </>
              )}
              {m.morningOnly && <p className={s.note}>Действует на занятия до 12:00</p>}
            </div>
            <div className={s.memCell}>
              <p className={s.memDate}>{expired ? 'Закончился' : 'Действует до'} {formatFullDate(m.expiresAt)}</p>
              <div className={`${s.bar} ${frozen ? s.barFrozen : ''}`} role="progressbar" aria-label="Осталось дней" aria-valuemin={0} aria-valuemax={totalDays} aria-valuenow={daysLeft}>
                <i style={{ width: `${daysPct}%` }} />
              </div>
              <p className={s.note}>{expired ? 'Срок действия истёк' : `Осталось ${daysText(daysLeft)}`}</p>
            </div>
          </div>
          <div className={s.memActions}>
            {ended ? (
              <Link to="/prices" className="btn btn-sm">Выбрать новый абонемент</Link>
            ) : m.freezeDaysLeft > 0 || frozen ? (
              <>
                {frozen ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={acc.unfreeze}>Разморозить</button>
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={acc.freeze}>Заморозить на 7 дней (демо)</button>
                )}
                <span className={s.note}>Доступно дней заморозки: {m.freezeDaysLeft}</span>
              </>
            ) : (
              <span className={s.note}>Этот абонемент не замораживается.</span>
            )}
          </div>
        </>
      ) : (
        <div className={s.memEmpty}>
          <p>Активного абонемента нет. Выберите пакет занятий или безлимит, чтобы записываться в расписании.</p>
          <Link to="/prices" className="btn btn-sm">Выбрать абонемент</Link>
        </div>
      )}
    </article>
  )

  const bookings = (
    <article className={s.panel} aria-labelledby="a-bk">
      <div className={s.panelHead}>
        <h2 id="a-bk">Мои записи</h2>
        {state.bookings.length > 0 && <span className={s.count}>{state.bookings.length}</span>}
      </div>
      {state.bookings.length === 0 ? (
        <div className={s.empty}>
          <p><strong>Предстоящих записей нет.</strong><br />Выберите занятие в расписании: запись займёт минуту.</p>
          <Link to="/schedule" className="btn btn-sm">Посмотреть расписание</Link>
        </div>
      ) : (
        <ul className={s.bookings}>
          {state.bookings.map((b) => {
            const d = minskDate(b.start)
            return (
              <li key={b.classId} className={s.booking}>
                {dateTile(b.start, b.direction)}
                <div className={s.bkBody}>
                  <p className={s.bkTime}>{weekdayShort[weekdayIndex(d)]}, {formatTime(b.start)}–{formatTime(b.end)}</p>
                  <h3 className={s.bkTitle}><i className={s.dot} style={{ background: dirColor(b.direction) }} aria-hidden="true" />{dirName(b.direction)}</h3>
                  <p className={s.meta}>{[trainerName(b.trainer), hallById(b.hall)?.name].filter(Boolean).join(' · ')}</p>
                  <div className={s.bkActions}>{bookingActions(b)}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )

  const waitlist = (
    <article className={s.panel} aria-labelledby="a-wl">
      <h2 id="a-wl">Лист ожидания</h2>
      {state.waitlist.length === 0 ? (
        <p className={s.muted}>Вы не стоите в очереди. Если на занятии нет мест, встаньте в лист ожидания прямо в расписании.</p>
      ) : (
        <ul className={s.wl}>
          {state.waitlist.map((w) => (
            <li key={w.classId}>
              <span className={s.pos} aria-label={`№${w.ahead + 1} в очереди`}>№{w.ahead + 1}</span>
              <div className={s.wlBody}>
                <p className={s.wlTitle}><i className={s.dot} style={{ background: dirColor(w.direction) }} aria-hidden="true" />{dirName(w.direction)}</p>
                <p className={s.meta}>{formatDateTime(w.start)}{trainerName(w.trainer) && ` · ${trainerName(w.trainer)}`}</p>
              </div>
              <div className={s.wlActions}>
                <button type="button" className="btn btn-sm" onClick={() => acc.simulateRelease(w.classId)}>Симуляция: освободилось место</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => acc.leaveWaitlist(w.classId)}>Выйти из очереди</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )

  const statsPanel = (
    <article className={s.panel} aria-labelledby="a-st">
      <h2 id="a-st">Статистика</h2>
      <dl className={s.stats}>
        <div><Icon name="month" /><dt>В этом месяце</dt><dd>{stats.thisMonth}</dd></div>
        <div><Icon name="total" /><dt>Всего посещений</dt><dd>{stats.total}</dd></div>
        <div><Icon name="fav" /><dt>Любимое направление</dt><dd className={s.ddText}>{stats.favorite ? dirName(stats.favorite) : 'пока нет'}</dd></div>
        <div><Icon name="streak" /><dt>Недель подряд</dt><dd>{stats.streak}</dd></div>
      </dl>
      <figure className={s.chart}>
        <figcaption>Посещения по неделям</figcaption>
        <div className={`${s.chartLabels} ${s.chartCounts}`} aria-hidden="true">
          {stats.weekly.map((w, i) => <span key={i}>{w.count || ''}</span>)}
        </div>
        <svg viewBox={`0 0 ${stats.weekly.length * 20} 60`} preserveAspectRatio="none" role="img"
          aria-label={stats.weekly.map((w) => `неделя с ${w.monday.getUTCDate()} ${monthsShort[w.monday.getUTCMonth()]}: ${w.count}`).join('; ')}>
          {stats.weekly.map((w, i) => {
            const h = w.count ? Math.max(6, (w.count / maxWeek) * 56) : 2
            return <rect key={i} x={i * 20 + 3} y={60 - h} width="14" height={h} rx="2" className={w.count ? s.barOn : s.barOff} />
          })}
        </svg>
        <div className={s.chartLabels} aria-hidden="true">
          {stats.weekly.map((w, i) => (
            <span key={i}>{w.monday.getUTCDate()}.{String(w.monday.getUTCMonth() + 1).padStart(2, '0')}</span>
          ))}
        </div>
      </figure>
    </article>
  )

  const history = (
    <article className={s.panel} aria-labelledby="a-hi">
      <h2 id="a-hi">История посещений</h2>
      {state.history.length === 0 ? (
        <p className={s.muted}>Здесь появятся занятия, которые вы посетили.</p>
      ) : (
        <>
          <ol className={s.feed}>
            {state.history.slice(0, historyShown).map((h) => (
              <li key={h.classId}>
                <i className={s.dot} style={{ background: dirColor(h.direction) }} aria-hidden="true" />
                <span className={s.feedDate}>{formatDateTime(h.start)}</span>
                <span className={s.feedName}>{dirName(h.direction)}{trainerName(h.trainer) && <span className={s.meta}> · {trainerName(h.trainer)}</span>}</span>
              </li>
            ))}
          </ol>
          {historyShown < state.history.length && (
            <button type="button" className={`btn btn-ghost btn-sm ${s.more}`} onClick={() => setHistoryShown((n) => n + HISTORY_PAGE * 2)}>
              Показать ещё ({state.history.length - historyShown})
            </button>
          )}
        </>
      )}
    </article>
  )

  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className={`container ${s.top}`}>
          <div>
            <div className={s.demo} role="note">Демо-режим: данные хранятся только в вашем браузере</div>
            <h1>Здравствуйте, {state.user.name}</h1>
            <p className={s.phone}>{state.user.phone}</p>
          </div>
          <div className={s.topActions}>
            <Link to="/schedule" className="btn">Записаться на занятие</Link>
            <button type="button" className="btn btn-ghost" onClick={acc.logout}>Выйти</button>
          </div>
        </div>
      </section>

      <section className={`section ${s.body}`}>
        <div className={`container ${s.layout}`}>
          <div className={s.main}>
            <div className={s.oMem}>{membership}</div>
            <div className={s.oBk}>{bookings}</div>
          </div>
          <div className={s.side}>
            <div className={s.oSt}>{statsPanel}</div>
            <div className={s.oWl}>{waitlist}</div>
          </div>
          <div className={s.oHi}>{history}</div>
          <div className={s.reset}>
            {confirmReset ? (
              <>
                <span>Удалить записи, абонемент и историю?</span>
                <button type="button" className="btn btn-sm" onClick={() => { acc.reset(); setConfirmReset(false) }}>Да, сбросить всё</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Не сбрасывать</button>
              </>
            ) : (
              <button type="button" className={s.linkBtn} onClick={() => setConfirmReset(true)}>Сбросить демо-данные</button>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
