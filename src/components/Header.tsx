import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAccount } from '../context/account-context'
import s from './Header.module.css'

const links = [
  ['/schedule', 'Расписание'], ['/directions', 'Направления'], ['/trainers', 'Тренеры'], ['/prices', 'Цены'],
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const { state } = useAccount()
  const close = () => setOpen(false)
  return (
    <header className={`${s.header} dark`}>
      <div className={`container ${s.row}`}>
        <Link to="/" className={s.logo} onClick={close} aria-label="Пульс — на главную">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><path d="M2 17h7l3-8 5 15 3-7h10" fill="none" stroke="#ff5a3c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ПУЛЬС
        </Link>
        <button type="button" className={s.burger} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          {open ? 'Закрыть' : 'Меню'}
        </button>
        <nav id="main-nav" className={`${s.nav} ${open ? s.open : ''}`} aria-label="Основное меню">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={close} className={({ isActive }) => (isActive ? s.active : '')}>{label}</NavLink>
          ))}
          <Link to="/account" className="btn btn-sm" onClick={close}>{state.user ? 'Кабинет' : 'Войти'}</Link>
        </nav>
      </div>
    </header>
  )
}
