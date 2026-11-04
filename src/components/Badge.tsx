import type { ReactNode } from 'react'
import s from './Badge.module.css'

export type Tone = 'accent' | 'blue' | 'amber' | 'green' | 'muted'

export function Badge({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`${s.badge} ${s[tone]}`}>{children}</span>
}
