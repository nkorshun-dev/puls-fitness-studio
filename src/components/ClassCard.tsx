import { directionBySlug } from '../data/directions'
import { hallById } from '../data/halls'
import { levelLabels } from '../data/schedule-template'
import { trainerBySlug } from '../data/trainers'
import { useAccount } from '../context/account-context'
import { classView } from '../lib/class-view'
import { formatTime } from '../lib/dates'
import { spotsText } from '../lib/format'
import type { ClassItem } from '../lib/types'
import { Badge } from './Badge'
import s from './ClassCard.module.css'

interface Props {
  cls: ClassItem
  onOpen: (c: ClassItem) => void
  compact?: boolean
}

export function ClassCard({ cls, onOpen, compact }: Props) {
  const { state, now } = useAccount()
  const v = classView(cls, state, now)
  const dir = directionBySlug(cls.direction)
  const trainer = trainerBySlug(cls.trainer)
  const time = formatTime(cls.start)
  const name = dir?.name ?? 'Занятие'
  const few = v.left > 0 && v.left <= 3

  return (
    <button
      type="button"
      className={`${s.card} ${s[v.status]} ${compact ? s.compact : ''}`}
      style={{ '--dir': dir?.color } as React.CSSProperties}
      onClick={() => onOpen(cls)}
    >
      <span className={s.time}>{time}</span>
      <span className={s.name}>{name}</span>
      <span className={s.meta}>
        {trainer?.name}{cls.substituted ? ' (замена)' : ''} · {hallById(cls.hall)?.name}
      </span>
      {!compact && <span className={s.meta}>{levelLabels[cls.level]}</span>}
      {cls.cancelReason ? (
        <span className={s.reason}>Отменено: {cls.cancelReason}</span>
      ) : (
        <span className={s.foot}>
          {v.status === 'booked' && <Badge tone="green">Вы записаны</Badge>}
          {v.status === 'waitlist' && <Badge tone="blue">Лист ожидания №{v.waitPos}</Badge>}
          {v.status === 'past' && <Badge>Прошло</Badge>}
          {v.status === 'closed' && <Badge>Запись закрыта</Badge>}
          {v.status === 'full' && <Badge tone="muted">Мест нет</Badge>}
          {v.status === 'open' && <span className={few ? s.few : s.spots}>{spotsText(v.left, cls.capacity)}</span>}
          {(v.status === 'booked' || v.status === 'waitlist') && <span className={s.spots}>{spotsText(v.left, cls.capacity)}</span>}
        </span>
      )}
    </button>
  )
}
