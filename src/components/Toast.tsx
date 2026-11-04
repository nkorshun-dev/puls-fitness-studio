import { useEffect } from 'react'
import type { ToastKind } from '../context/toast-context'
import s from './Toast.module.css'

export interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(item.id), 5000)
    return () => window.clearTimeout(t)
  }, [item.id, onDismiss])
  return (
    <div className={`${s.toast} ${s[item.kind]}`}>
      <span>{item.message}</span>
      <button type="button" onClick={() => onDismiss(item.id)} aria-label="Закрыть уведомление">×</button>
    </div>
  )
}

export function ToastList({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className={s.list} role="status" aria-live="polite" aria-atomic="false">
      {items.map((i) => <ToastView key={i.id} item={i} onDismiss={onDismiss} />)}
    </div>
  )
}
