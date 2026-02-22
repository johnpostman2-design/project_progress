// Firebase configuration
// This file will be populated with actual Firebase config during implementation
// TODO: Add Firebase project configuration

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let initPromise: Promise<void> | null = null

export const initializeFirebase = (config: {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}): void => {
  if (!app) {
    console.log('[firebaseConfig] Initializing Firebase app...')
    app = initializeApp(config)
    db = getFirestore(app)
    console.log('[firebaseConfig] Firebase app initialized, db:', !!db)
  } else {
    console.log('[firebaseConfig] Firebase already initialized')
  }
}

// Ленивая инициализация - только при первом использовании
const ensureInitialized = (): void => {
  if (app && db) {
    return // Уже инициализирован
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase config is missing. Check your .env file.')
  }

  // Синхронная инициализация для немедленного использования
  if (!app) {
    console.log('[firebaseConfig] Lazy initializing Firebase from env vars')
    initializeFirebase(firebaseConfig)
  }
}

// Предварительная инициализация в фоне (не блокирует рендеринг)
// ВРЕМЕННО ОТКЛЮЧЕНО для ускорения загрузки
// if (typeof window !== 'undefined') {
//   // Используем requestIdleCallback для инициализации в свободное время
//   if ('requestIdleCallback' in window) {
//     requestIdleCallback(() => {
//       try {
//         ensureInitialized()
//       } catch (e) {
//         // Игнорируем ошибки при фоновой инициализации
//       }
//     }, { timeout: 1000 })
//   } else {
//     // Fallback для браузеров без requestIdleCallback
//     setTimeout(() => {
//       try {
//         ensureInitialized()
//       } catch (e) {
//         // Игнорируем ошибки при фоновой инициализации
//       }
//     }, 0)
//   }
// }

export const getFirestoreInstance = (): Firestore => {
  ensureInitialized()
  
  if (!db) {
    console.error('[firebaseConfig] Firebase not initialized. db is null')
    throw new Error('Firebase not initialized. Call initializeFirebase() first.')
  }
  return db
}

export { db }
