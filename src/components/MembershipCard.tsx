import type { Plan } from '../data/memberships'
import { formatBYN, visitsText } from '../lib/format'
import { Badge } from './Badge'
import s from './MembershipCard.module.css'

interface Props {
  plan: Plan
  onBuy: (planId: string) => void
  dark?: boolean
}

export function MembershipCard({ plan, onBuy, dark }: Props) {
  return (
    <article className={`${s.card} ${plan.popular ? s.popular : ''} ${dark ? 'dark' : ''}`}>
      <div className={s.top}>
        <h3>{plan.name}</h3>
        {plan.popular && <Badge tone="accent">Популярный</Badge>}
      </div>
      <p className={s.price}>{formatBYN(plan.price)}</p>
      <p className={s.sub}>
        {plan.visits === null ? 'без ограничения занятий' : visitsText(plan.visits)}
        {plan.perVisit !== null && plan.visits !== 1 && ` · ${formatBYN(plan.perVisit)} за занятие`}
      </p>
      <ul className={s.list}>
        <li>Действует {plan.days} дн.</li>
        <li>{plan.freezeDays ? `Заморозка до ${plan.freezeDays} дн.` : 'Без заморозки'}</li>
        {plan.morningOnly && <li>Занятия до 12:00</li>}
      </ul>
      <p className={s.note}>{plan.note}</p>
      <button type="button" className={plan.popular ? 'btn' : 'btn btn-ghost'} onClick={() => onBuy(plan.id)} aria-label={`Оформить: ${plan.name}, ${formatBYN(plan.price)}`}>
        Оформить
      </button>
    </article>
  )
}
