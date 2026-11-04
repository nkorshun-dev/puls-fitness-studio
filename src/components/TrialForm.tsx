import { useEffect, useState, type FormEvent } from 'react'
import { directions } from '../data/directions'
import { studio } from '../data/studio'
import { seeded } from '../lib/schedule'
import { maskChange } from '../lib/phone-mask'
import { validateTrial, type TrialErrors, type TrialValues } from '../lib/validation'
import s from './Form.module.css'

const times = ['Утром (7:00–10:00)', 'В обед (12:00–14:00)', 'Вечером (18:00–21:30)', 'В выходные']
const empty: TrialValues = { name: '', phone: '', direction: '', time: '', consent: false }

export function TrialForm() {
  const [v, setV] = useState<TrialValues>(empty)
  const [errors, setErrors] = useState<TrialErrors>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  // Имитация запроса ~900 мс; таймер снимается, если форму закрыли раньше.
  useEffect(() => {
    if (!sending) return
    const t = window.setTimeout(() => {
      setSending(false)
      setDone(`П-${Math.floor(1000 + seeded(v.phone + Date.now()) * 9000)}`)
    }, 900)
    return () => window.clearTimeout(t)
  }, [sending, v.phone])

  const set = <K extends keyof TrialValues>(k: K, val: TrialValues[K]) => setV((x) => ({ ...x, [k]: val }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateTrial(v)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setSending(true)
  }

  if (done) {
    return (
      <div className={s.success} role="status">
        <p>Заявка принята</p>
        <strong>№ {done}</strong>
        <p>Администратор позвонит вам по номеру {v.phone} и подберёт занятие. Пробное стоит {studio.trialPrice} BYN.</p>
        <p className={s.demo}>Демо-режим: данные никуда не отправляются.</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setV(empty); setDone(null) }}>Отправить ещё одну</button>
      </div>
    )
  }

  const err = (k: keyof TrialValues) => errors[k] && <span id={`t-${k}-err`} className={s.error} role="alert">{errors[k]}</span>
  const aria = (k: keyof TrialValues) => ({ 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `t-${k}-err` : undefined })

  return (
    <form className={s.form} onSubmit={submit} noValidate aria-label="Запись на пробное занятие">
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor="t-name">Имя</label>
          <input id="t-name" autoComplete="given-name" value={v.name} onChange={(e) => set('name', e.target.value)} {...aria('name')} />
          {err('name')}
        </div>
        <div className={s.field}>
          <label htmlFor="t-phone">Телефон</label>
          <input id="t-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 (29) 123-45-67" value={v.phone} onChange={(e) => set('phone', maskChange(e.target, v.phone))} {...aria('phone')} />
          {err('phone')}
        </div>
      </div>
      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor="t-direction">Направление</label>
          <select id="t-direction" value={v.direction} onChange={(e) => set('direction', e.target.value)} {...aria('direction')}>
            <option value="">Выберите</option>
            {directions.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
          {err('direction')}
        </div>
        <div className={s.field}>
          <label htmlFor="t-time">Удобное время</label>
          <select id="t-time" value={v.time} onChange={(e) => set('time', e.target.value)} {...aria('time')}>
            <option value="">Выберите</option>
            {times.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {err('time')}
        </div>
      </div>
      <div className={s.field}>
        <label className={s.check}>
          <input type="checkbox" checked={v.consent} onChange={(e) => set('consent', e.target.checked)} {...aria('consent')} />
          Согласен на обработку персональных данных для связи по заявке
        </label>
        {err('consent')}
      </div>
      <button type="submit" className="btn" disabled={sending}>{sending ? 'Отправляем…' : `Пробное занятие за ${studio.trialPrice} BYN`}</button>
      <p className={s.demo}>Демо-режим: данные никуда не отправляются.</p>
    </form>
  )
}
