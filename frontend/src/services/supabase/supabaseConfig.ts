// Supabase configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export const initializeSupabase = (config: {
  supabaseUrl: string
  supabaseAnonKey: string
}): void => {
  if (!supabase) {
    console.log('[supabaseConfig] Initializing Supabase client...')
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    console.log('[supabaseConfig] Supabase client initialized')
  } else {
    console.log('[supabaseConfig] Supabase already initialized')
  }
}

// Ленивая инициализация - только при первом использовании
const ensureInitialized = (): void => {
  if (supabase) {
    return // Уже инициализирован
  }

  const supabaseConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }

  if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
    const hint = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? ' Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Environment Variables на Vercel (Project → Settings → Environment Variables) и переразверните.'
      : ' Проверьте файл .env в папке frontend.'
    throw new Error('Supabase config is missing.' + hint)
  }

  // Синхронная инициализация для немедленного использования
  if (!supabase) {
    console.log('[supabaseConfig] Lazy initializing Supabase from env vars')
    initializeSupabase(supabaseConfig)
  }
}

export const getSupabaseInstance = (): SupabaseClient => {
  ensureInitialized()
  
  if (!supabase) {
    console.error('[supabaseConfig] Supabase not initialized. supabase is null')
    throw new Error('Supabase not initialized. Call initializeSupabase() first.')
  }
  return supabase
}

export { supabase }
