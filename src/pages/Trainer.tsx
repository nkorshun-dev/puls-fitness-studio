import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClassCard } from '../components/ClassCard'
import { ClassModal } from '../components/ClassModal'
import { useAccount } from '../context/account-context'
import { directionBySlug } from '../data/directions'
import { trainerBySlug } from '../data/trainers'
import { upcomingClasses } from '../lib/schedule'
import { usePageMeta } from '../lib/seo'
import type { ClassItem } from '../lib/types'
import NotFound from './NotFound'
import p from './Page.module.css'

export default function Trainer() {
  const { slug = '' } = useParams()
  const t = trainerBySlug(slug)
  usePageMeta(t?.name ?? 'Не найдено', t?.bio)
  const { now } = useAccount()
  const [open, setOpen] = useState<ClassItem | null>(null)
  if (!t) return <NotFound />

  const next = upcomingClasses(now, 400).filter((c) => c.trainer === t.slug).slice(0, 6)

  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className={`container ${p.split}`}>
          <img className={p.photo} style={{ aspectRatio: '4 / 5', maxWidth: 420 }} src={t.photo} alt={`Тренер ${t.name}`} width={600} height={750} />
          <div>
            <p className="eyebrow"><Link to="/trainers">Тренеры</Link></p>
            <h1>{t.name}</h1>
            <p className="lead">Опыт {t.experience} {t.experience < 5 ? 'года' : 'лет'}</p>
            <p>{t.bio}</p>
            <h2 style={{ fontSize: '1.1rem' }}>Направления</h2>
            <ul className={p.chips}>
              {t.directions.map((d) => <li key={d}><Link to={`/directions/${d}`}>{directionBySlug(d)?.name}</Link></li>)}
            </ul>
            <h2 style={{ fontSize: '1.1rem' }}>Сертификаты</h2>
            <ul className={p.list}>{t.certificates.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Ближайшие занятия</h2>
          {next.length ? <div className={p.cards}>{next.map((c) => <ClassCard key={c.id} cls={c} onOpen={setOpen} />)}</div> : <p>Ближайших занятий нет.</p>}
          <p style={{ marginTop: 20 }}><Link to={`/schedule?trainer=${t.slug}`} className="btn">Всё расписание тренера</Link></p>
        </div>
      </section>
      {open && <ClassModal cls={open} onClose={() => setOpen(null)} />}
    </>
  )
}
