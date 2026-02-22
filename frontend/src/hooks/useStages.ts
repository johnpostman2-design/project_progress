import { useState, useEffect } from 'react'
import { Stage } from '../models/stage'
import { getStages } from '../services/supabase/supabaseService'
import { SupabaseError } from '../services/supabase/supabaseTypes'

export const useStages = (projectId: string | null) => {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadStages = async () => {
    if (!projectId) {
      setStages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const stagesData = await getStages(projectId)
      setStages(stagesData)
    } catch (err) {
      setError(err instanceof Error ? err : new SupabaseError('Failed to load stages'))
    } finally {
    setLoading(false)
    }
  }

  useEffect(() => {
    loadStages()
  }, [projectId])

  return { stages, loading, error, refetch: loadStages }
}
