import { useState } from 'react'
import { Link } from 'react-router-dom'
import { directionBySlug } from '../data/directions'
import { hallById } from '../data/halls'
import { levelLabels } from '../data/schedule-template'
import { trainerBySlug } from '../data/trainers'
import { useAccount } from '../context/account-context'
import { classView, toRef } from '../lib/class-view'
import { formatDateTime, formatTime } from '../lib/dates'
import { spotsText } from '../lib/format'
import { cancelPolicy, decideBooking, seatsLeft } from '../lib/rules'
import type { ClassItem } from '../lib/types'
import { Badge } from './Badge'
import { LoginForm } from './LoginForm'
import { Modal } from './Modal'
import s from './ClassModal.module.css'

export function ClassModal({ cls, onClose }: { cls: ClassItem; onClose: () => void }) {
  const acc = useAccount()
  const { state, now } = acc
  const [confirmCancel, setConfirmCancel] = useState(false)
  const v = classView(cls, state, now)
  const dir = directionBySlug(cls.direction)
  const trainer = trainerBySlug(cls.trainer)
  const baseFree = seatsLeft(cls.capacity, cls.booked)
  const decision = decideBooking(state, toRef(cls), baseFree, now)
  const needPlan = !decision.ok && decision.reason === 'no-membership'
  const blocked = !decision.ok && !needPlan ? decision.reason : ''
  const late = v.status === 'booked' && cancelPolicy(now, cls.start) === 'late'
  const title = `${dir?.name}, ${formatDateTime(cls.start)}`

  return (
    <Modal title={title} onClose={onClose}>
      <p className={s.dir} style={{ '--dir': dir?.color } as React.CSSProperties}>{dir?.name}</p>
      <h2 className={s.title}>{formatDateTime(cls.start)}–{formatTime(cls.end)}</h2>
      <dl className={s.facts}>
        <dt>Тренер</dt>
        <dd><Link to={`/trainers/${cls.trainer}`} onClick={onClose}>{trainer?.name}</Link>{cls.substituted && ' (замена)'}</dd>
        <dt>Зал</dt>
        <dd>{hallById(cls.hall)?.name}</dd>
        <dt>Уровень</dt>
        <dd>{levelLabels[cls.level]}</dd>
        <dt>Места</dt>
        <dd>{spotsText(v.left, cls.capacity)}</dd>
      </dl>
      <p>{dir?.short} {dir?.description}</p>
      <p className={s.bring}><strong>Что взять:</strong> {dir?.bring}</p>

      <div className={s.actions}>
        {v.status === 'cancelled' && <p className={s.note}>Занятие отменено: {cls.cancelReason}. Выберите другое время в расписании.</p>}
        {v.status === 'past' && <p className={s.note}>Это занятие уже прошло.</p>}
        {v.status === 'closed' && <p className={s.note}>Запись закрыта: она заканчивается за 30 минут до начала.</p>}

        {(v.status === 'open' || v.status === 'full') && !state.user && (
          <>
            <p className={s.note}>Чтобы записаться, войдите в демо-кабинет.</p>
            <LoginForm compact />
          </>
        )}

        {(v.status === 'open' || v.status === 'full') && state.user && needPlan && (
          <div className={s.plan}>
            <p className={s.note}>Для записи нужен абонемент. Начните с пробного или купите разовое занятие (демо, оплата не выполняется).</p>
            {!state.trialUsed && <button type="button" className="btn" onClick={() => acc.buy('trial')}>Пробное за 9 BYN</button>}
            <button type="button" className="btn btn-ghost" onClick={() => acc.buy('single')}>Разовое за 19 BYN</button>
            <Link to="/prices" className={s.more} onClick={onClose}>Все абонементы</Link>
          </div>
        )}

        {(v.status === 'open' || v.status === 'full') && state.user && !needPlan && (
          <>
            {blocked && <p className={s.note} role="alert">{blocked}</p>}
            {v.status === 'open' ? (
              <button type="button" className="btn" disabled={Boolean(blocked)} onClick={() => acc.book(cls)}>Записаться</button>
            ) : (
              <>
                <p className={s.note}>Мест нет. В листе ожидания вы будете №{cls.waitlistBase + 1}: если кто-то отменит запись, место получит первый в очереди.</p>
                <button type="button" className="btn" disabled={Boolean(blocked)} onClick={() => acc.joinWaitlist(cls)}>Встать в лист ожидания</button>
              </>
            )}
          </>
        )}

        {v.status === 'waitlist' && (
          <>
            <Badge tone="blue">Вы в листе ожидания №{v.waitPos}</Badge>
            <button type="button" className="btn" onClick={() => acc.simulateRelease(cls.id)}>Симуляция: кто-то отменил запись</button>
            <button type="button" className="btn btn-ghost" onClick={() => acc.leaveWaitlist(cls.id)}>Выйти из листа ожидания</button>
          </>
        )}

        {v.status === 'booked' && (
          <>
            <Badge tone="green">Вы записаны</Badge>
            {late && <p className={s.note} role="alert">До начала меньше 3 часов: при отмене занятие спишется с абонемента.</p>}
            {confirmCancel ? (
              <div className={s.row}>
                <button type="button" className="btn" onClick={() => { acc.cancel(cls.id); setConfirmCancel(false) }}>Да, отменить</button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmCancel(false)}>Не отменять</button>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => (late ? setConfirmCancel(true) : acc.cancel(cls.id))}>Отменить запись</button>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
