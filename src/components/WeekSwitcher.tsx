import { addDays, formatRange } from '../lib/dates'
import s from './WeekSwitcher.module.css'

interface Props {
  week: number
  weekStart: Date
  max: number
  onChange: (w: number) => void
  onToday: () => void
}

export function WeekSwitcher({ week, weekStart, max, onChange, onToday }: Props) {
  const label = week === 0 ? 'Текущая неделя' : week === 1 ? 'Следующая неделя' : 'Через неделю'
  return (
    <div className={s.bar}>
      <button type="button" className="btn btn-ghost btn-sm" disabled={week <= 0} onClick={() => onChange(week - 1)} aria-label="Предыдущая неделя">←</button>
      <div className={s.label} aria-live="polite">
        <strong>{label}</strong>
        <span>{formatRange(weekStart, addDays(weekStart, 6))}</span>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" disabled={week >= max} onClick={() => onChange(week + 1)} aria-label="Следующая неделя">→</button>
      <button type="button" className="btn btn-sm" onClick={onToday}>Сегодня</button>
    </div>
  )
}
