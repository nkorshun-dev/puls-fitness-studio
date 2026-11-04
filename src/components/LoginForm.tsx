import { useState, type FormEvent } from 'react'
import { useAccount } from '../context/account-context'
import { maskChange } from '../lib/phone-mask'
import { validateName, validatePhone } from '../lib/validation'
import s from './Form.module.css'

/** Демо-вход: имя и телефон, без пароля. */
export function LoginForm({ compact }: { compact?: boolean }) {
  const { login } = useAccount()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = { name: validateName(name), phone: validatePhone(phone) }
    setErrors({ name: errs.name || undefined, phone: errs.phone || undefined })
    if (!errs.name && !errs.phone) login(name, phone)
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate aria-label="Демо-вход">
      {!compact && <p className={s.hint}>Демо-вход без пароля. Введите любое имя и номер: данные останутся в вашем браузере.</p>}
      <div className={s.field}>
        <label htmlFor="login-name">Имя</label>
        <input id="login-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'login-name-err' : undefined} />
        {errors.name && <span id="login-name-err" className={s.error} role="alert">{errors.name}</span>}
      </div>
      <div className={s.field}>
        <label htmlFor="login-phone">Телефон</label>
        <input id="login-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 (29) 123-45-67" value={phone} onChange={(e) => setPhone(maskChange(e.target, phone))} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'login-phone-err' : undefined} />
        {errors.phone && <span id="login-phone-err" className={s.error} role="alert">{errors.phone}</span>}
      </div>
      <button type="submit" className="btn">Войти в кабинет</button>
    </form>
  )
}
