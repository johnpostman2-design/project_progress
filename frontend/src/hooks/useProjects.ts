import { useState, useEffect } from 'react'
import { Project } from '../models/project'
import { getActiveProjects, getArchivedProjects } from '../services/supabase/supabaseService'
import { SupabaseError } from '../services/supabase/supabaseTypes'

export const useProjects = (includeArchived = false) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false) // Временно отключена загрузка
  const [error, setError] = useState<Error | null>(null)

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      if (includeArchived) {
        const archived = await getArchivedProjects()
        setProjects(archived)
      } else {
        const active = await getActiveProjects()
        setProjects(active)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new SupabaseError('Failed to load projects'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [includeArchived])

  return { projects, loading, error, refetch: loadProjects }
}
