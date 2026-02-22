// Utility functions for date conversion between Supabase (Date) and Firebase Timestamp
import { Timestamp } from 'firebase/firestore'

/**
 * Convert Date to Firebase Timestamp
 */
export const dateToTimestamp = (date: Date | undefined | null): Timestamp | undefined => {
  if (!date) return undefined
  return Timestamp.fromDate(date)
}

/**
 * Convert Firebase Timestamp to Date
 */
export const timestampToDate = (timestamp: Timestamp | undefined | null): Date | undefined => {
  if (!timestamp) return undefined
  return timestamp.toDate()
}

/**
 * Convert Date string (from Supabase) to Firebase Timestamp
 */
export const stringToTimestamp = (dateString: string | undefined | null): Timestamp | undefined => {
  if (!dateString) return undefined
  return Timestamp.fromDate(new Date(dateString))
}

/**
 * Convert Date to ISO string (for Supabase)
 */
export const dateToISO = (date: Date | undefined | null): string | undefined => {
  if (!date) return undefined
  return date.toISOString()
}
