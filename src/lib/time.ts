// Студия работает по Минску: UTC+3 круглый год (без перехода на летнее время).
// "Минская дата" — Date, у которой UTC-поля равны настенному времени в Минске. Читать её только через getUTC*.
export const MINSK_OFFSET = 3 * 60 * 60_000

export const minskDate = (ms: number = Date.now()) => new Date(ms + MINSK_OFFSET)
