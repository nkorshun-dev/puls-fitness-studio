import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { LoginForm } from '../components/LoginForm'
import { useAccount } from '../context/account-context'
import { directionBySlug } from '../data/directions'
import { trainerBySlug } from '../data/trainers'
import { atTime, formatDateTime, formatFullDate } from '../lib/dates'
import { minskDate } from '../lib/time'
import { visitsText } from '../lib/format'
import { cancelPolicy, isFrozen } from '../lib/rules'
import { usePageMeta } from '../lib/seo'
import s from './Account.module.css'
import p from './Page.module.css'

export default function Account() {
  usePageMeta('Личный кабинет', 'Демо-кабинет клиента студии «Пульс»: абонемент, записи, лист ожидания и история посещений.')
  const acc = useAccount()
  const { state, now } = acc
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

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
  const m0 = minskDate(now)
  const monthStart = atTime(new Date(Date.UTC(m0.getUTCFullYear(), m0.getUTCMonth(), 1)), '00:00')
  const thisMonth = state.history.filter((h) => h.start >= monthStart).length
  const counts = new Map<string, number>()
  state.history.forEach((h) => counts.set(h.direction, (counts.get(h.direction) ?? 0) + 1))
  const fav = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const progress = m && m.visitsTotal ? Math.round(((m.visitsLeft ?? 0) / m.visitsTotal) * 100) : 100

  const label = (c: { direction: string; start: number; trainer: string }) =>
    `${directionBySlug(c.direction)?.name}, ${formatDateTime(c.start)} · ${trainerBySlug(c.trainer)?.name}`

  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className="container">
          <div className={s.demo} role="note">Демо-режим: данные хранятся только в вашем браузере</div>
          <h1>Здравствуйте, {state.user.name}</h1>
          <p className="lead">{state.user.phone}</p>
          <div className={s.row}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={acc.logout}>Выйти</button>
            {confirmReset ? (
              <>
                <button type="button" className="btn btn-sm" onClick={() => { acc.reset(); setConfirmReset(false) }}>Да, сбросить всё</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Не сбрасывать</button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(true)}>Сбросить демо-данные</button>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBlock: '40px 64px' }}>
        <div className={`container ${s.grid}`}>
          <article className={`${s.panel} ${s.wide}`} aria-labelledby="a-mem">
            <h2 id="a-mem">Абонемент</h2>
            {m ? (
              <>
                <p className={s.big}>{m.name} {frozen && <Badge tone="blue">Заморожен до {formatFullDate(m.frozenUntil!)}</Badge>} {expired && <Badge tone="amber">Срок истёк</Badge>}</p>
                <p>
                  {m.visitsLeft === null ? 'Безлимитные занятия' : `Осталось: ${visitsText(m.visitsLeft)} из ${m.visitsTotal}`}
                  {' · '}действует до {formatFullDate(m.expiresAt)}
                </p>
                {m.visitsLeft !== null && (
                  <div className={s.bar} role="progressbar" aria-label="Остаток занятий" aria-valuemin={0} aria-valuemax={m.visitsTotal ?? 0} aria-valuenow={m.visitsLeft}>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                )}
                {m.freezeDaysLeft > 0 || frozen ? (
                  <div className={s.row}>
                    {frozen ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={acc.unfreeze}>Разморозить</button>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" disabled={expired} onClick={acc.freeze}>Заморозить на 7 дней (демо)</button>
                    )}
                    <span className={s.muted}>Доступно дней заморозки: {m.freezeDaysLeft}</span>
                  </div>
                ) : (
                  <p className={s.muted}>Этот абонемент не замораживается.</p>
                )}
              </>
            ) : (
              <>
                <p>Активного абонемента нет.</p>
                <p><Link to="/prices" className="btn btn-sm">Выбрать абонемент</Link></p>
              </>
            )}
          </article>

          <article className={s.panel} aria-labelledby="a-bk">
            <h2 id="a-bk">Мои записи</h2>
            {state.bookings.length === 0 ? (
              <p className={s.muted}>Предстоящих записей нет. <Link to="/schedule">Открыть расписание</Link></p>
            ) : (
              <ul className={s.items}>
                {state.bookings.map((b) => {
                  const late = cancelPolicy(now, b.start) === 'late'
                  return (
                    <li key={b.classId}>
                      <strong>{label(b)}</strong>
                      {late && <span className={s.warn}>До начала меньше 3 часов: при отмене занятие спишется.</span>}
                      {confirmId === b.classId ? (
                        <span className={s.row}>
                          <button type="button" className="btn btn-sm" onClick={() => { acc.cancel(b.classId); setConfirmId(null) }}>Да, отменить</button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Не отменять</button>
                        </span>
                      ) : (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => (late ? setConfirmId(b.classId) : acc.cancel(b.classId))}>Отменить запись</button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </article>

          <article className={s.panel} aria-labelledby="a-wl">
            <h2 id="a-wl">Лист ожидания</h2>
            {state.waitlist.length === 0 ? (
              <p className={s.muted}>Вы не стоите в очереди ни на одно занятие.</p>
            ) : (
              <ul className={s.items}>
                {state.waitlist.map((w) => (
                  <li key={w.classId}>
                    <strong>{label(w)}</strong>
                    <Badge tone="blue">№{w.ahead + 1} в очереди</Badge>
                    <span className={s.row}>
                      <button type="button" className="btn btn-sm" onClick={() => acc.simulateRelease(w.classId)}>Симуляция: освободилось место</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => acc.leaveWaitlist(w.classId)}>Выйти из очереди</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={s.panel} aria-labelledby="a-st">
            <h2 id="a-st">Статистика</h2>
            <div className={p.facts}>
              <div className={p.fact}><b>{thisMonth}</b><span>занятий в этом месяце</span></div>
              <div className={p.fact}><b>{state.history.length}</b><span>всего посещений</span></div>
            </div>
            <p>Любимое направление: <strong>{fav ? directionBySlug(fav)?.name : 'пока нет данных'}</strong></p>
          </article>

          <article className={s.panel} aria-labelledby="a-hi">
            <h2 id="a-hi">История посещений</h2>
            {state.history.length === 0 ? (
              <p className={s.muted}>Здесь появятся занятия, которые вы посетили.</p>
            ) : (
              <ul className={s.items}>
                {state.history.slice(0, 10).map((h) => <li key={h.classId}>{label(h)}</li>)}
              </ul>
            )}
          </article>
        </div>
      </section>
    </>
  )
}
