import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClassCard } from '../components/ClassCard'
import { ClassModal } from '../components/ClassModal'
import { useAccount } from '../context/account-context'
import { directionBySlug } from '../data/directions'
import { trainers } from '../data/trainers'
import { upcomingClasses } from '../lib/schedule'
import { usePageMeta } from '../lib/seo'
import type { ClassItem } from '../lib/types'
import NotFound from './NotFound'
import p from './Page.module.css'

export default function Direction() {
  const { slug = '' } = useParams()
  const d = directionBySlug(slug)
  usePageMeta(d?.name ?? 'Не найдено', d?.short)
  const { now } = useAccount()
  const [open, setOpen] = useState<ClassItem | null>(null)
  if (!d) return <NotFound />

  const next = upcomingClasses(now, 400).filter((c) => c.direction === d.slug).slice(0, 6)
  const tr = trainers.filter((t) => t.directions.includes(d.slug))

  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className={`container ${p.split}`}>
          <div>
            <p className="eyebrow"><Link to="/directions">Направления</Link></p>
            <h1>{d.name}</h1>
            <p className="lead">{d.short}</p>
            <p>{d.description}</p>
            <p><strong>Для кого:</strong> {d.forWhom}</p>
            <p><strong>Что взять:</strong> {d.bring}</p>
            <p id="load-label"><strong>Нагрузка:</strong> {d.intensity} из 5</p>
            <div className={p.meter} role="img" aria-labelledby="load-label">
              {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= d.intensity ? 'on' : ''} style={i <= d.intensity ? { background: d.color } : undefined} />)}
            </div>
          </div>
          <img draggable="false" className={p.photo} src={d.image} alt={`Занятие: ${d.name}`} width={800} height={600} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Ближайшие занятия</h2>
          <div className={p.cards}>
            {next.map((c) => <ClassCard key={c.id} cls={c} onOpen={setOpen} />)}
          </div>
          <p style={{ marginTop: 20 }}><Link to={`/schedule?dir=${d.slug}`} className="btn">Всё расписание по направлению</Link></p>
        </div>
      </section>
      <section className="section dark">
        <div className="container">
          <h2>Тренеры направления</h2>
          <div className={p.cards}>
            {tr.map((t) => (
              <Link key={t.slug} to={`/trainers/${t.slug}`} className={p.person}>
                <img draggable="false" src={t.photo} alt={`Тренер ${t.name}`} loading="lazy" width={600} height={750} />
                <div className={p.personBody}><h3>{t.name}</h3><p>Опыт {t.experience} {t.experience < 5 ? 'года' : 'лет'}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {open && <ClassModal cls={open} onClose={() => setOpen(null)} />}
    </>
  )
}
