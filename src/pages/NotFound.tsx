import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import p from './Page.module.css'

export default function NotFound() {
  usePageMeta('Страница не найдена', 'Такой страницы нет. Вернитесь на главную или откройте расписание студии «Пульс».')
  return (
    <section className={`section dark ${p.head}`} style={{ minHeight: '60vh' }}>
      <div className="container">
        <p className="eyebrow">Ошибка 404</p>
        <h1>Такой страницы нет</h1>
        <p className="lead">Возможно, ссылка устарела. Вернитесь на главную или откройте расписание.</p>
        <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/" className="btn">На главную</Link>
          <Link to="/schedule" className="btn btn-ghost">Расписание</Link>
        </p>
      </div>
    </section>
  )
}
