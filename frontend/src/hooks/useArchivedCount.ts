import { useState, useEffect } from 'react'
import { getArchivedProjects } from '../services/supabase/supabaseService'
import { SupabaseError } from '../services/supabase/supabaseTypes'

export const useArchivedCount = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadCount = async () => {
    try {
      setLoading(true)
      setError(null)
      const archived = await getArchivedProjects()
      setCount(archived.length)
    } catch (err) {
      setError(err instanceof Error ? err : new SupabaseError('Failed to load archived count'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCount()
  }, [])

  return { count, loading, error, refetch: loadCount }
}
