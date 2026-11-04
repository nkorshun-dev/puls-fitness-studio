import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastList, type ToastItem } from '../components/Toast'
import { ToastContext, type ToastKind } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), [])
  const push = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++seq.current
    setItems((xs) => [...xs.slice(-2), { id, message, kind }])
  }, [])
  const api = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastList items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
