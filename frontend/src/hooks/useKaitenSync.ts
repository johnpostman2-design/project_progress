import { useState, useCallback } from 'react'
import { Project } from '../models/project'
import { Task } from '../models/task'
import { syncProjectTasks } from '../services/sync/syncService'
import { KaitenConfig, KaitenApiError, NetworkError } from '../services/kaiten/kaitenTypes'

export const useKaitenSync = (config: KaitenConfig | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const syncProject = useCallback(
    async (project: Project): Promise<Task[]> => {
      if (!config) {
        throw new Error('Kaiten config is not set')
      }

      try {
        setLoading(true)
        setError(null)

        const tasks = await syncProjectTasks(project, config)
        return tasks
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to sync project tasks')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [config]
  )

  return {
    syncProject,
    loading,
    error,
  }
}
