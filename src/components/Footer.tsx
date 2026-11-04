import { Link } from 'react-router-dom'
import { studio } from '../data/studio'
import { DemoLink } from './DemoLink'
import s from './Footer.module.css'

export function Footer() {
  return (
    <footer className={`${s.footer} dark`}>
      <div className={`container ${s.grid}`}>
        <div>
          <p className={s.brand}>ПУЛЬС</p>
          <p>{studio.city}, {studio.address}</p>
          <p><DemoLink label={`Телефон ${studio.phone}`}>{studio.phone}</DemoLink><br />{studio.hours}</p>
        </div>
        <nav aria-label="Нижнее меню" className={s.links}>
          <Link to="/schedule">Расписание</Link>
          <Link to="/directions">Направления</Link>
          <Link to="/trainers">Тренеры</Link>
          <Link to="/prices">Цены</Link>
          <Link to="/account">Личный кабинет</Link>
        </nav>
      </div>
      <p className={`container ${s.demo}`}>Демо-проект для портфолио. Бизнес вымышленный, данные хранятся только в вашем браузере.</p>
    </footer>
  )
}
