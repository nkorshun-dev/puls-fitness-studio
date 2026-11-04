import { useEffect, useRef, type ReactNode } from 'react'
import s from './Modal.module.css'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Нативный <dialog>: фокус остаётся внутри, Esc закрывает, фокус возвращается на кнопку-источник. */
export function Modal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const opener = document.activeElement as HTMLElement | null
    d.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      d.close()
      // диалог уже убран из DOM, браузер сам фокус не вернёт
      if (opener?.isConnected) opener.focus()
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <dialog
      ref={ref}
      className={`${s.dialog} dark`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={s.body}>
        <button type="button" className={s.close} onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>
        {children}
      </div>
    </dialog>
  )
}
