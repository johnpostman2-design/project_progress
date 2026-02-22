import { getSupabaseInstance } from './supabaseConfig'
import { Project, validateProjectName, validateProjectDates } from '../../models/project'
import { Stage, validateStageName, validateStageDates, validatePauseReason } from '../../models/stage'
import { Timestamp } from 'firebase/firestore'
import {
  SupabaseError,
  NotFoundError,
  ValidationError,
  ProjectInput,
  StageInput,
} from './supabaseTypes'
import { dateToTimestamp, stringToTimestamp, dateToISO } from './dateUtils'

// Projects table
const PROJECTS_TABLE = 'projects'
const STAGES_TABLE = 'stages'

/**
 * Convert Supabase project row to Project model
 */
const mapProjectRow = (row: any): Project => {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date ? stringToTimestamp(row.start_date) : undefined,
    endDate: row.end_date ? stringToTimestamp(row.end_date) : undefined,
    status: row.status,
    kaitenBoardId: row.kaiten_board_id,
    createdAt: stringToTimestamp(row.created_at) || Timestamp.now(),
    updatedAt: stringToTimestamp(row.updated_at) || Timestamp.now(),
  }
}

/**
 * Convert Project model to Supabase row
 */
const mapProjectToRow = (project: Partial<Project> | ProjectInput): any => {
  const row: any = {}
  if ('name' in project) row.name = project.name
  if ('status' in project) row.status = project.status || 'active'
  if ('kaitenBoardId' in project) row.kaiten_board_id = project.kaitenBoardId
  
  // Handle dates - convert Date or Timestamp to ISO string
  if ('startDate' in project && project.startDate) {
    row.start_date = project.startDate instanceof Date 
      ? dateToISO(project.startDate)
      : project.startDate instanceof Timestamp
      ? dateToISO(project.startDate.toDate())
      : project.startDate
  }
  if ('endDate' in project && project.endDate) {
    row.end_date = project.endDate instanceof Date
      ? dateToISO(project.endDate)
      : project.endDate instanceof Timestamp
      ? dateToISO(project.endDate.toDate())
      : project.endDate
  }
  
  return row
}

/**
 * Convert Supabase stage row to Stage model
 */
const mapStageRow = (row: any): Stage => {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    startDate: stringToTimestamp(row.start_date) || Timestamp.now(),
    endDate: stringToTimestamp(row.end_date) || Timestamp.now(),
    status: row.status,
    pauseReason: row.pause_reason,
    kaitenGroupId: row.kaiten_group_id,
    createdAt: stringToTimestamp(row.created_at) || Timestamp.now(),
    updatedAt: stringToTimestamp(row.updated_at) || Timestamp.now(),
  }
}

/**
 * Convert Stage model to Supabase row
 */
const mapStageToRow = (stage: Partial<Stage> | StageInput, projectId?: string): any => {
  const row: any = {}
  if ('name' in stage) row.name = stage.name
  if ('status' in stage) row.status = stage.status || 'active'
  if ('pauseReason' in stage) row.pause_reason = stage.pauseReason
  if ('kaitenGroupId' in stage) row.kaiten_group_id = stage.kaitenGroupId
  if (projectId) row.project_id = projectId
  
  // Handle dates - convert Date or Timestamp to ISO string
  if ('startDate' in stage && stage.startDate) {
    row.start_date = stage.startDate instanceof Date
      ? dateToISO(stage.startDate)
      : stage.startDate instanceof Timestamp
      ? dateToISO(stage.startDate.toDate())
      : stage.startDate
  }
  if ('endDate' in stage && stage.endDate) {
    row.end_date = stage.endDate instanceof Date
      ? dateToISO(stage.endDate)
      : stage.endDate instanceof Timestamp
      ? dateToISO(stage.endDate.toDate())
      : stage.endDate
  }
  
  return row
}

/**
 * Get all projects
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    const supabase = getSupabaseInstance()
    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapProjectRow)
  } catch (error) {
    throw new SupabaseError(
      `Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Get active projects (exclude archived)
 */
export const getActiveProjects = async (): Promise<Project[]> => {
  try {
    const supabase = getSupabaseInstance()
    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapProjectRow)
  } catch (error) {
    throw new SupabaseError(
      `Failed to get active projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Get archived projects
 */
export const getArchivedProjects = async (): Promise<Project[]> => {
  try {
    const supabase = getSupabaseInstance()
    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .eq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapProjectRow)
  } catch (error) {
    throw new SupabaseError(
      `Failed to get archived projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Get project by ID
 */
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const supabase = getSupabaseInstance()
    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return data ? mapProjectRow(data) : null
  } catch (error) {
    throw new SupabaseError(
      `Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Create new project
 */
export const createProject = async (project: ProjectInput): Promise<Project> => {
  console.log('[supabaseService] createProject called', { projectName: project.name })
  
  // Validation
  if (!validateProjectName(project.name)) {
    console.error('[supabaseService] Validation failed: project name')
    throw new ValidationError('Project name must be non-empty and max 200 characters')
  }

  if (project.startDate && project.endDate) {
    if (!validateProjectDates(project.startDate, project.endDate)) {
      console.error('[supabaseService] Validation failed: project dates')
      throw new ValidationError('Project endDate must be >= startDate')
    }
  }

  try {
    console.log('[supabaseService] Getting Supabase instance...')
    const supabase = getSupabaseInstance()
    console.log('[supabaseService] Supabase instance obtained')
    
    const now = new Date()
    const projectData = {
      ...mapProjectToRow(project),
      status: project.status || 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }

    console.log('[supabaseService] Inserting project to Supabase...', { projectData })
    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .insert(projectData)
      .select()
      .single()

    if (error) throw error

    console.log('[supabaseService] Project created with ID:', data.id)
    
    const createdProject = mapProjectRow(data)
    console.log('[supabaseService] Created project object:', createdProject)
    return createdProject
  } catch (error) {
    console.error('[supabaseService] Error creating project:', error)
    throw new SupabaseError(
      `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Update project
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  try {
    const supabase = getSupabaseInstance()

    // Check if project exists
    const { data: existing, error: fetchError } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError || !existing) {
      throw new NotFoundError(`Project with id ${projectId} not found`)
    }

    // Validation
    if (updates.name !== undefined && !validateProjectName(updates.name)) {
      throw new ValidationError('Project name must be non-empty and max 200 characters')
    }

    const currentProject = mapProjectRow(existing)
    const startDate = updates.startDate ?? currentProject.startDate
    const endDate = updates.endDate ?? currentProject.endDate

    if (startDate && endDate && !validateProjectDates(startDate, endDate)) {
      throw new ValidationError('Project endDate must be >= startDate')
    }

    const updateData = {
      ...mapProjectToRow(updates),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from(PROJECTS_TABLE)
      .update(updateData)
      .eq('id', projectId)

    if (error) throw error
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new SupabaseError(
      `Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Delete project (and all its stages)
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const supabase = getSupabaseInstance()

    // Check if project exists
    const { data: existing, error: fetchError } = await supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError || !existing) {
      throw new NotFoundError(`Project with id ${projectId} not found`)
    }

    // Delete all stages first
    const stages = await getStages(projectId)
    for (const stage of stages) {
      await deleteStage(projectId, stage.id)
    }

    // Delete project
    const { error } = await supabase
      .from(PROJECTS_TABLE)
      .delete()
      .eq('id', projectId)

    if (error) throw error
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new SupabaseError(
      `Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Delete all projects (and all their stages)
 * WARNING: This is a destructive operation!
 */
export const deleteAllProjects = async (): Promise<void> => {
  try {
    const supabase = getSupabaseInstance()
    const { data: projects, error: fetchError } = await supabase
      .from(PROJECTS_TABLE)
      .select('id')

    if (fetchError) throw fetchError

    // Delete all projects (stages will be deleted via CASCADE or manually)
    for (const project of projects || []) {
      await deleteProject(project.id)
    }
  } catch (error) {
    throw new SupabaseError(
      `Failed to delete all projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Get all stages for a project
 */
export const getStages = async (projectId: string): Promise<Stage[]> => {
  try {
    const supabase = getSupabaseInstance()
    const { data, error } = await supabase
      .from(STAGES_TABLE)
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true })

    if (error) throw error

    return (data || []).map(mapStageRow)
  } catch (error) {
    throw new SupabaseError(
      `Failed to get stages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Create new stage in project
 */
export const createStage = async (projectId: string, stage: StageInput): Promise<Stage> => {
  // Validation
  if (!validateStageName(stage.name)) {
    throw new ValidationError('Stage name must be non-empty and max 200 characters')
  }

  // Валидируем даты только если они указаны
  if (stage.startDate && stage.endDate) {
    if (!validateStageDates(stage.startDate, stage.endDate)) {
      throw new ValidationError('Stage endDate must be >= startDate')
    }
  }

  if (!validatePauseReason(stage.status || 'active', stage.pauseReason)) {
    throw new ValidationError('Pause reason is required when stage status is paused')
  }

  try {
    const supabase = getSupabaseInstance()
    const now = new Date()

    const stageData = {
      ...mapStageToRow(stage, projectId),
      status: stage.status || 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }

    const { data, error } = await supabase
      .from(STAGES_TABLE)
      .insert(stageData)
      .select()
      .single()

    if (error) throw error

    return mapStageRow(data)
  } catch (error) {
    throw new SupabaseError(
      `Failed to create stage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Update stage
 */
export const updateStage = async (
  projectId: string,
  stageId: string,
  updates: Partial<Stage>
): Promise<void> => {
  try {
    const supabase = getSupabaseInstance()
    const id = String(stageId)

    // Check if stage exists
    const { data: existing, error: fetchError } = await supabase
      .from(STAGES_TABLE)
      .select('*')
      .eq('id', id)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existing) {
      throw new NotFoundError(`Stage with id ${id} not found`)
    }

    // Validation
    if (updates.name !== undefined && !validateStageName(updates.name)) {
      throw new ValidationError('Stage name must be non-empty and max 200 characters')
    }

    const currentStage = mapStageRow(existing)
    const startDate = updates.startDate ?? currentStage.startDate
    const endDate = updates.endDate ?? currentStage.endDate

    if (startDate && endDate && !validateStageDates(startDate, endDate)) {
      throw new ValidationError('Stage endDate must be >= startDate')
    }

    const status = updates.status ?? currentStage.status
    const pauseReason = updates.pauseReason ?? currentStage.pauseReason

    if (!validatePauseReason(status, pauseReason)) {
      throw new ValidationError('Pause reason is required when stage status is paused')
    }

    const updateData = {
      ...mapStageToRow(updates, projectId),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from(STAGES_TABLE)
      .update(updateData)
      .eq('id', id)
      .eq('project_id', projectId)

    if (error) throw error
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new SupabaseError(
      `Failed to update stage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Delete stage
 */
export const deleteStage = async (projectId: string, stageId: string): Promise<void> => {
  try {
    const supabase = getSupabaseInstance()

    // Check if stage exists
    const { data: existing, error: fetchError } = await supabase
      .from(STAGES_TABLE)
      .select('*')
      .eq('id', stageId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existing) {
      throw new NotFoundError(`Stage with id ${stageId} not found`)
    }

    const { error } = await supabase
      .from(STAGES_TABLE)
      .delete()
      .eq('id', stageId)
      .eq('project_id', projectId)

    if (error) throw error
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new SupabaseError(
      `Failed to delete stage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}
