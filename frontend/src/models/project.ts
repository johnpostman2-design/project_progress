import { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  startDate?: Timestamp
  endDate?: Timestamp
  status: ProjectStatus
  kaitenBoardId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ProjectInput {
  name: string
  startDate?: Date
  endDate?: Date
  status?: ProjectStatus
  kaitenBoardId?: string
}

// Validation rules
export const validateProjectName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 200
}

export const validateProjectDates = (
  startDate?: Timestamp | Date,
  endDate?: Timestamp | Date
): boolean => {
  if (!startDate || !endDate) return true

  const start = startDate instanceof Timestamp ? startDate.toDate() : startDate
  const end = endDate instanceof Timestamp ? endDate.toDate() : endDate

  return end >= start
}

// State transition functions
export const canCompleteProject = (project: Project): boolean => {
  return project.status === 'active'
}

export const canArchiveProject = (project: Project): boolean => {
  return project.status === 'active' || project.status === 'completed'
}

export const completeProject = (project: Project): Project => {
  if (!canCompleteProject(project)) {
    throw new Error(`Cannot complete project with status: ${project.status}`)
  }
  return {
    ...project,
    status: 'completed',
    updatedAt: Timestamp.now(),
  }
}

export const archiveProject = (project: Project): Project => {
  if (!canArchiveProject(project)) {
    throw new Error(`Cannot archive project with status: ${project.status}`)
  }
  return {
    ...project,
    status: 'archived',
    updatedAt: Timestamp.now(),
  }
}

export const canRestoreProject = (project: Project): boolean => {
  return project.status === 'archived'
}

export const restoreProject = (project: Project): Project => {
  if (!canRestoreProject(project)) {
    throw new Error(`Cannot restore project with status: ${project.status}`)
  }
  return {
    ...project,
    status: 'active',
    updatedAt: Timestamp.now(),
  }
}
