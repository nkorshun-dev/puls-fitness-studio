import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClassCard } from '../components/ClassCard'
import { ClassModal } from '../components/ClassModal'
import { DemoLink } from '../components/DemoLink'
import { MembershipCard } from '../components/MembershipCard'
import { TrialForm } from '../components/TrialForm'
import { useAccount } from '../context/account-context'
import { directions } from '../data/directions'
import { faq } from '../data/faq'
import { halls } from '../data/halls'
import { plans } from '../data/memberships'
import { reviews } from '../data/reviews'
import { minskDate } from '../lib/time'
import { studio } from '../data/studio'
import { trainers } from '../data/trainers'
import { formatDayMonth } from '../lib/dates'
import { classesOfToday } from '../lib/schedule'
import { usePageMeta } from '../lib/seo'
import type { ClassItem } from '../lib/types'
import { useBuy } from '../lib/use-buy'
import s from './Home.module.css'
import p from './Page.module.css'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ExerciseGym',
  name: 'Пульс',
  description: 'Студия групповых тренировок в Минске: пилатес, йога, TRX, сайкл, зумба.',
  image: studio.heroPhoto,
  telephone: studio.phone,
  email: studio.email,
  priceRange: '9–279 BYN',
  address: { '@type': 'PostalAddress', streetAddress: studio.address, addressLocality: 'Минск', addressCountry: 'BY' },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '22:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '10:00', closes: '20:00' },
  ],
}

// фото hero локально (public/img), тот же набор предзагружается в index.html
const heroBase = `${import.meta.env.BASE_URL}img/hero-`
const heroSet = (ext: string) => [640, 1024, 1600, 2400].map((w) => `${heroBase}${w}.${ext} ${w}w`).join(', ')

export default function Home() {
  usePageMeta('', 'Студия «Пульс» в Минске: пилатес, йога, TRX, сайкл, зумба. Расписание на 3 недели, запись онлайн, пробное занятие за 9 BYN.')
  const { now } = useAccount()
  const buy = useBuy()
  const [open, setOpen] = useState<ClassItem | null>(null)
  const today = classesOfToday(now).filter((c) => c.end > now && !c.cancelReason).slice(0, 6)

  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.text = JSON.stringify(jsonLd)
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
  }, [])

  return (
    <>
      <section className={`section dark ${s.hero}`}>
        <picture>
          <source type="image/avif" srcSet={heroSet('avif')} sizes="100vw" />
          <img draggable="false" className={s.bg} src={`${heroBase}1600.webp`} srcSet={heroSet('webp')} sizes="100vw" alt="" width={1600} height={1000} fetchPriority="high" />
        </picture>
        <div className="container">
          <p className="eyebrow">Фитнес-студия в центре Минска</p>
          <h1>Групповые тренировки в Минске — <em>от 7 утра до 22 вечера</em></h1>
          <p className="lead">Пилатес, йога, TRX, сайкл и ещё 4 направления. Малые группы, понятное расписание и запись за минуту.</p>
          <div className={s.cta}>
            <Link to="/#trial" className="btn">Пробное занятие за {studio.trialPrice} BYN</Link>
            <Link to="/schedule" className="btn btn-ghost">Расписание</Link>
          </div>
          <div className={s.stats}>
            {studio.facts.map((f) => <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-dir">
        <div className="container">
          <div className={p.sectionHead}><h2 id="h-dir">8 направлений</h2><Link to="/directions">Все направления</Link></div>
          <div className={p.cards}>
            {directions.map((d) => (
              <Link key={d.slug} to={`/directions/${d.slug}`} className={p.dirCard} style={{ '--dir': d.color } as React.CSSProperties}>
                <img draggable="false" src={d.image} alt="" loading="lazy" width={800} height={600} />
                <div className={p.dirBody}><h3>{d.name}</h3><p>{d.short}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark" aria-labelledby="h-today">
        <div className="container">
          <div className={p.sectionHead}><h2 id="h-today">Ближайшие занятия сегодня</h2><span className="lead">{formatDayMonth(minskDate(now))}</span></div>
          {today.length ? (
            <div className={s.today}>{today.map((c) => <ClassCard key={c.id} cls={c} onOpen={setOpen} />)}</div>
          ) : (
            <p className="lead">На сегодня занятия закончились. Загляните в расписание на завтра.</p>
          )}
          <p className={s.more}><Link to="/schedule" className="btn btn-ghost">Всё расписание</Link></p>
        </div>
      </section>

      <section className="section" aria-labelledby="h-tr">
        <div className="container">
          <div className={p.sectionHead}><h2 id="h-tr">Тренеры</h2><Link to="/trainers">Все тренеры</Link></div>
          <div className={p.cards}>
            {trainers.slice(0, 4).map((t) => (
              <Link key={t.slug} to={`/trainers/${t.slug}`} className={p.person}>
                <img draggable="false" src={t.photo} alt={`Тренер ${t.name}`} loading="lazy" width={600} height={750} />
                <div className={p.personBody}><h3>{t.name}</h3><p>Опыт {t.experience} {t.experience < 5 ? "года" : "лет"}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark" aria-labelledby="h-pr">
        <div className="container">
          <div className={p.sectionHead}><h2 id="h-pr">Абонементы</h2><Link to="/prices">Все цены и сравнение</Link></div>
          <div className={s.trio}>
            {plans.filter((x) => ['pack8', 'unlimited', 'morning'].includes(x.id)).map((x) => <MembershipCard key={x.id} plan={x} onBuy={buy} />)}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-st">
        <div className={`container ${p.split}`}>
          <div>
            <p className="eyebrow">Студия</p>
            <h2 id="h-st">{studio.area} м² для тренировок и отдыха после</h2>
            <ul className={p.list}>{studio.amenities.map((a) => <li key={a}>{a}</li>)}</ul>
            <div className={s.halls}>
              {halls.map((h) => (
                <div key={h.id} className={s.hall}>
                  <img draggable="false" src={h.image} alt="" loading="lazy" width={96} height={72} />
                  <div><h3>{h.name}</h3><p>{h.area} м², до {h.capacity} человек. {h.description}</p></div>
                </div>
              ))}
            </div>
          </div>
          <img draggable="false" className={p.photo} src={studio.photo} alt="Интерьер студии «Пульс»" loading="lazy" width={1200} height={800} />
        </div>
      </section>

      <section className="section dark" aria-labelledby="h-rev">
        <div className="container">
          <div className={p.sectionHead}><h2 id="h-rev">Отзывы</h2></div>
          <div className={p.reviewGrid}>
            {reviews.map((r) => (
              <article key={r.id} className={p.review}>
                <header>
                  <strong>{r.author}</strong>
                  <time dateTime={r.date}>{new Date(r.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>
                </header>
                <div className={p.stars} role="img" aria-label={`Оценка ${r.rating} из 5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p>{r.text}</p>
                {r.reply && <p className={p.reply}><strong>Ответ студии:</strong> {r.reply}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-faq">
        <div className="container">
          <h2 id="h-faq">Вопросы и ответы</h2>
          <div className={p.faq}>
            {faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </div>
      </section>

      <section id="trial" className="section dark" aria-labelledby="h-trial">
        <div className="container">
          <h2 id="h-trial">Пробное занятие за {studio.trialPrice} BYN</h2>
          <p className="lead">Оставьте номер: администратор подберёт занятие под ваш уровень и время.</p>
          <div className={p.formBox}><TrialForm /></div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-ct">
        <div className={`container ${p.contacts}`}>
          <div>
            <h2 id="h-ct">Контакты</h2>
            <p>{studio.city}, {studio.address}</p>
            <p><DemoLink label={`Телефон ${studio.phone}`}>{studio.phone}</DemoLink></p>
            <p><DemoLink label={`Почта ${studio.email}`}>{studio.email}</DemoLink></p>
            <p>{studio.hours}</p>
          </div>
          <div>
            <p><strong>Как добраться</strong></p>
            <p>{studio.city}, {studio.address}</p>
            <p>15 минут пешком от станции метро «Немига». Автобусы и троллейбусы до остановки «Пр-т Победителей».</p>
            <p>Парковка во дворе, 25 мест, бесплатно для клиентов.</p>
          </div>
        </div>
        <div className={`container ${p.mapBox}`}>
          <iframe
            title="Карта: студия «Пульс», Минск, пр-т Победителей, 84"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=27.5220%2C53.9135%2C27.5420%2C53.9235&layer=mapnik&marker=53.9188%2C27.5318"
          />
        </div>
      </section>

      {open && <ClassModal cls={open} onClose={() => setOpen(null)} />}
    </>
  )
}
