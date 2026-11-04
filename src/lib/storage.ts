// Слой хранения: localStorage с try/catch и версией схемы.
// Если версия не совпала или JSON битый — возвращаем null, сайт стартует с чистого состояния.
export const SCHEMA_VERSION = 1
const PREFIX = 'puls:'

interface Envelope<T> {
  v: number
  data: T
}

export function loadJSON<T>(key: string, isValid: (x: unknown) => x is T): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const env = JSON.parse(raw) as Envelope<unknown>
    if (!env || env.v !== SCHEMA_VERSION || !isValid(env.data)) return null
    return env.data
  } catch {
    return null
  }
}

export function saveJSON<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: SCHEMA_VERSION, data } satisfies Envelope<T>))
    return true
  } catch {
    return false // приватный режим или переполнение: работаем без сохранения
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* хранилище недоступно */
  }
}
