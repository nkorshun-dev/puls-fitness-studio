import { useEffect } from 'react'

const SITE = 'Пульс — фитнес-студия в Минске'

/** Меняет title и description страницы. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Пульс` : SITE
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
