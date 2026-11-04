import { CompareTable } from '../components/CompareTable'
import { MembershipCard } from '../components/MembershipCard'
import { TrialForm } from '../components/TrialForm'
import { plans, promos } from '../data/memberships'
import { studio } from '../data/studio'
import { usePageMeta } from '../lib/seo'
import { useBuy } from '../lib/use-buy'
import p from './Page.module.css'

export default function Prices() {
  usePageMeta('Цены и абонементы', 'Абонементы студии «Пульс»: пробное 9 BYN, разовое 19 BYN, 8 занятий 118 BYN, безлимит 164 BYN, утренний безлимит 97 BYN.')
  const buy = useBuy()
  return (
    <>
      <section className={`section dark ${p.head}`}>
        <div className="container">
          <h1>Цены и абонементы</h1>
          <p className="lead">Цена за занятие снижается с размером абонемента. Кнопка «Оформить» работает в демо-режиме: оплата не выполняется, абонемент появится в личном кабинете.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className={p.cards} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))' }}>
            {plans.map((x) => <MembershipCard key={x.id} plan={x} onBuy={buy} />)}
          </div>
        </div>
      </section>
      <section className="section dark">
        <div className="container">
          <h2>Сравнение</h2>
          <CompareTable />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Акции</h2>
          <div className={p.cards}>
            {promos.map((x) => <article key={x.title} className={p.fact}><h3>{x.title}</h3><span>{x.text}</span></article>)}
          </div>
        </div>
      </section>
      <section className="section dark">
        <div className="container">
          <h2>Пробное занятие за {studio.trialPrice} BYN</h2>
          <p className="lead">Оставьте заявку, и администратор подберёт занятие.</p>
          <div className={p.formBox}><TrialForm /></div>
        </div>
      </section>
    </>
  )
}
