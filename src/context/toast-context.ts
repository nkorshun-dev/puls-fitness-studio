import { createContext, useContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info'
export interface ToastApi {
  push: (message: string, kind?: ToastKind) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast вне ToastProvider')
  return ctx
}
