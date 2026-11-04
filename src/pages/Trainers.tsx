import { Link } from 'react-router-dom'
import { directionBySlug } from '../data/directions'
import { trainers } from '../data/trainers'
import { usePageMeta } from '../lib/seo'
import p from './Page.module.css'

export default function Trainers() {
  usePageMeta('Тренеры', '7 тренеров студии «Пульс»: опыт от 2 до 11 лет, подтверждённые сертификаты.')
  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className="container">
          <h1>Тренеры</h1>
          <p className="lead">Семь человек с опытом от 2 до 11 лет. У каждого есть сертификаты по своему направлению.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className={`container ${p.cards}`}>
          {trainers.map((t) => (
            <Link key={t.slug} to={`/trainers/${t.slug}`} className={p.person}>
              <img draggable="false" src={t.photo} alt={`Тренер ${t.name}`} loading="lazy" width={600} height={750} />
              <div className={p.personBody}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{t.name}</h2>
                <p>{t.directions.map((d) => directionBySlug(d)?.name).join(', ')}</p>
                <p>Опыт {t.experience} {t.experience < 5 ? 'года' : 'лет'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
