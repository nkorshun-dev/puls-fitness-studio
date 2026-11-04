import { plans } from '../data/memberships'
import { formatBYN } from '../lib/format'
import s from './CompareTable.module.css'

export function CompareTable() {
  return (
    <div className={s.wrap} tabIndex={0} role="region" aria-label="Сравнение абонементов (таблицу можно прокрутить)">
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">Абонемент</th>
            <th scope="col">Цена</th>
            <th scope="col">Занятий</th>
            <th scope="col">За занятие</th>
            <th scope="col">Срок</th>
            <th scope="col">Заморозка</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.name}</th>
              <td>{formatBYN(p.price)}</td>
              <td>{p.visits === null ? 'Безлимит' : p.visits}</td>
              <td>{p.perVisit === null ? '—' : formatBYN(p.perVisit)}</td>
              <td>{p.days} дн.</td>
              <td>{p.freezeDays ? `до ${p.freezeDays} дн.` : 'нет'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
