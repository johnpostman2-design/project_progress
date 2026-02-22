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
