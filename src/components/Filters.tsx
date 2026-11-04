import { directions } from '../data/directions'
import { halls } from '../data/halls'
import { levelLabels } from '../data/schedule-template'
import { trainers } from '../data/trainers'
import { emptyFilters, hasFilters, type Filters as F } from '../lib/filters'
import s from './Filters.module.css'

interface Props {
  value: F
  onChange: (f: F) => void
}

const parts = [['morning', 'Утро (до 12:00)'], ['day', 'День (12–17)'], ['evening', 'Вечер (после 17:00)']] as const

export function Filters({ value, onChange }: Props) {
  const set = <K extends keyof F>(k: K, v: F[K]) => onChange({ ...value, [k]: v })
  return (
    <form className={s.filters} aria-label="Фильтры расписания" onSubmit={(e) => e.preventDefault()}>
      <label>
        Направление
        <select value={value.dir} onChange={(e) => set('dir', e.target.value)}>
          <option value="">Все</option>
          {directions.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </label>
      <label>
        Тренер
        <select value={value.trainer} onChange={(e) => set('trainer', e.target.value)}>
          <option value="">Все</option>
          {trainers.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
      </label>
      <label>
        Уровень
        <select value={value.level} onChange={(e) => set('level', e.target.value as F['level'])}>
          <option value="">Любой</option>
          {Object.entries(levelLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
      <label>
        Время дня
        <select value={value.part} onChange={(e) => set('part', e.target.value as F['part'])}>
          <option value="">Любое</option>
          {parts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
      <label>
        Зал
        <select value={value.hall} onChange={(e) => set('hall', e.target.value)}>
          <option value="">Все</option>
          {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </label>
      <label className={s.check}>
        <input type="checkbox" checked={value.free} onChange={(e) => set('free', e.target.checked)} />
        Только со свободными местами
      </label>
      {hasFilters(value) && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(emptyFilters)}>Сбросить</button>
      )}
    </form>
  )
}
