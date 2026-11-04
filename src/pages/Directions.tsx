import { Link } from 'react-router-dom'
import { directions } from '../data/directions'
import { usePageMeta } from '../lib/seo'
import p from './Page.module.css'

export default function Directions() {
  usePageMeta('Направления', 'Пилатес, функциональный тренинг, йога, стретчинг, TRX, сайкл, зумба и здоровая спина: 8 направлений в студии «Пульс».')
  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className="container">
          <h1>Направления</h1>
          <p className="lead">От мягкой растяжки до интервального сайкла. У каждого направления своя нагрузка и свой цвет в расписании.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className={`container ${p.cards}`}>
          {directions.map((d) => (
            <Link key={d.slug} to={`/directions/${d.slug}`} className={p.dirCard} style={{ '--dir': d.color } as React.CSSProperties}>
              <img src={d.image} alt="" loading="lazy" width={800} height={600} />
              <div className={p.dirBody}><h2 style={{ fontSize: '1.1rem', margin: 0 }}>{d.name}</h2><p>{d.short}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
