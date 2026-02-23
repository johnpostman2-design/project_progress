import { Timestamp } from 'firebase/firestore'

/**
 * Validate that endDate >= startDate
 */
export const validateDates = (
  startDate: Date | Timestamp | null | undefined,
  endDate: Date | Timestamp | null | undefined
): boolean => {
  if (!startDate || !endDate) {
    return true // If either is missing, validation passes
  }

  const start = startDate instanceof Timestamp ? startDate.toDate() : startDate
  const end = endDate instanceof Timestamp ? endDate.toDate() : endDate

  return end >= start
}

/**
 * Format date for display
 */
export const formatDate = (date: Date | Timestamp | null | undefined): string => {
  if (!date) return ''
  const d = date instanceof Timestamp ? date.toDate() : date
  return d.toLocaleDateString('ru-RU')
}

/**
 * Convert Date to Timestamp
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date)
}

/**
 * Convert Timestamp to Date
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate()
}

/**
 * Отключает изменение даты по стрелкам вверх/вниз в input type="date",
 * чтобы стрелки влево/вправо работали как перемещение между сегментами (день/месяц/год).
 */
export function preventDateInputArrowChange(e: { key: string; preventDefault(): void }): void {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
  }
}

/**
 * Парсит строку из буфера в YYYY-MM-DD для input type="date".
 * Поддерживает: YYYY-MM-DD, DD.MM.YYYY, DD.MM.YY, DD/MM/YYYY.
 */
export function parseDateFromPaste(text: string): string | null {
  const s = text.trim()
  if (!s) return null
  // Уже YYYY-MM-DD
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s)
  if (iso) {
    const [, y, m, d] = iso
    const date = new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10))
    if (!isNaN(date.getTime())) return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`
  }
  // DD.MM.YYYY или DD.MM.YY
  const dot = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/.exec(s)
  if (dot) {
    const [, d, m, y] = dot
    const year = y!.length === 2 ? 2000 + parseInt(y!, 10) : parseInt(y!, 10)
    const date = new Date(year, parseInt(m!, 10) - 1, parseInt(d!, 10))
    if (!isNaN(date.getTime())) return `${year}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`
  }
  // DD/MM/YYYY
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s)
  if (slash) {
    const [, d, m, y] = slash
    const year = y!.length === 2 ? 2000 + parseInt(y!, 10) : parseInt(y!, 10)
    const date = new Date(year, parseInt(m!, 10) - 1, parseInt(d!, 10))
    if (!isNaN(date.getTime())) return `${year}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`
  }
  return null
}

/**
 * Format date for display in format DD.MM.YY
 */
export const formatDateDisplay = (timestamp?: Timestamp | null): string => {
  if (!timestamp) return '00.00.00'
  try {
    const date = timestampToDate(timestamp)
    if (!date) return '00.00.00'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}.${month}.${year}`
  } catch (error) {
    return '00.00.00'
  }
}

/** Короткий формат для тултипа таймлайна: "28 янв" (без точки после месяца) */
export const formatDateShort = (dateOrTimestamp?: Date | Timestamp | { seconds?: number; nanoseconds?: number } | null): string => {
  if (!dateOrTimestamp) return ''
  try {
    let date: Date
    if (dateOrTimestamp instanceof Date) {
      date = dateOrTimestamp
    } else if (dateOrTimestamp instanceof Timestamp) {
      date = timestampToDate(dateOrTimestamp)
    } else if (typeof (dateOrTimestamp as { seconds?: number }).seconds === 'number') {
      date = new Date((dateOrTimestamp as { seconds: number }).seconds * 1000)
    } else {
      return ''
    }
    const s = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    return s.replace(/([а-яё]+)\./gi, '$1')
  } catch {
    return ''
  }
}
