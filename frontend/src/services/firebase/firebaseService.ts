import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { getFirestoreInstance } from './firebaseConfig'
import { Project, validateProjectName, validateProjectDates } from '../../models/project'
import { Stage, validateStageName, validateStageDates, validatePauseReason } from '../../models/stage'
import {
  FirebaseError,
  NotFoundError,
  ValidationError,
  ProjectInput,
  StageInput,
} from './firebaseTypes'

// Projects collection
const PROJECTS_COLLECTION = 'projects'

/**
 * Get all projects
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    const db = getFirestoreInstance()
    const projectsRef = collection(db, PROJECTS_COLLECTION)
    const q = query(projectsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[]
  } catch (error) {
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const projectsRef = collection(db, PROJECTS_COLLECTION)
    // Упрощаем запрос: только сортировка по дате создания, фильтрацию делаем на клиенте
    const q = query(projectsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    // Фильтруем на клиенте для ускорения
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((project: { id: string; status?: string }) => project.status !== 'archived') as Project[]
  } catch (error) {
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const projectsRef = collection(db, PROJECTS_COLLECTION)
    const q = query(projectsRef, where('status', '==', 'archived'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[]
  } catch (error) {
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
    const snapshot = await getDoc(projectRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Project
  } catch (error) {
    throw new FirebaseError(
      `Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Create new project
 */
export const createProject = async (project: ProjectInput): Promise<Project> => {
  console.log('[firebaseService] createProject called', { projectName: project.name })
  
  // Validation
  if (!validateProjectName(project.name)) {
    console.error('[firebaseService] Validation failed: project name')
    throw new ValidationError('Project name must be non-empty and max 200 characters')
  }

  if (project.startDate && project.endDate) {
    if (!validateProjectDates(project.startDate, project.endDate)) {
      console.error('[firebaseService] Validation failed: project dates')
      throw new ValidationError('Project endDate must be >= startDate')
    }
  }

  try {
    console.log('[firebaseService] Getting Firestore instance...')
    const db = getFirestoreInstance()
    console.log('[firebaseService] Firestore instance obtained')
    
    const projectsRef = collection(db, PROJECTS_COLLECTION)
    const now = Timestamp.now()

    const projectData = {
      ...project,
      status: project.status || 'active',
      createdAt: now,
      updatedAt: now,
    }

    console.log('[firebaseService] Adding document to Firestore...', { projectData })
    const docRef = await addDoc(projectsRef, projectData)
    console.log('[firebaseService] Document created with ID:', docRef.id)

    const createdProject = {
      id: docRef.id,
      ...projectData,
    } as Project
    
    console.log('[firebaseService] Created project object:', createdProject)
    return createdProject
  } catch (error) {
    console.error('[firebaseService] Error creating project:', error)
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId)

    // Check if project exists
    const snapshot = await getDoc(projectRef)
    if (!snapshot.exists()) {
      throw new NotFoundError(`Project with id ${projectId} not found`)
    }

    // Validation
    if (updates.name !== undefined && !validateProjectName(updates.name)) {
      throw new ValidationError('Project name must be non-empty and max 200 characters')
    }

    const currentData = snapshot.data() as Project
    const startDate = updates.startDate ?? currentData.startDate
    const endDate = updates.endDate ?? currentData.endDate

    if (startDate && endDate && !validateProjectDates(startDate, endDate)) {
      throw new ValidationError('Project endDate must be >= startDate')
    }

    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId)

    // Check if project exists
    const snapshot = await getDoc(projectRef)
    if (!snapshot.exists()) {
      throw new NotFoundError(`Project with id ${projectId} not found`)
    }

    // Delete all stages first
    const stages = await getStages(projectId)
    for (const stage of stages) {
      await deleteStage(projectId, stage.id)
    }

    // Delete project
    await deleteDoc(projectRef)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const projectsRef = collection(db, PROJECTS_COLLECTION)
    const snapshot = await getDocs(projectsRef)

    // Delete all projects
    for (const docSnapshot of snapshot.docs) {
      const projectId = docSnapshot.id
      await deleteProject(projectId)
    }
  } catch (error) {
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const stagesRef = collection(db, PROJECTS_COLLECTION, projectId, 'stages')
    const q = query(stagesRef, orderBy('startDate', 'asc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      projectId,
      ...doc.data(),
    })) as Stage[]
  } catch (error) {
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const stagesRef = collection(db, PROJECTS_COLLECTION, projectId, 'stages')
    const now = Timestamp.now()

    const stageData = {
      ...stage,
      projectId,
      status: stage.status || 'active',
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await addDoc(stagesRef, stageData)

    return {
      id: docRef.id,
      ...stageData,
    } as Stage
  } catch (error) {
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const stageRef = doc(db, PROJECTS_COLLECTION, projectId, 'stages', stageId)

    // Check if stage exists
    const snapshot = await getDoc(stageRef)
    if (!snapshot.exists()) {
      throw new NotFoundError(`Stage with id ${stageId} not found`)
    }

    // Validation
    if (updates.name !== undefined && !validateStageName(updates.name)) {
      throw new ValidationError('Stage name must be non-empty and max 200 characters')
    }

    const currentData = snapshot.data() as Stage
    const startDate = updates.startDate ?? currentData.startDate
    const endDate = updates.endDate ?? currentData.endDate

    if (startDate && endDate && !validateStageDates(startDate, endDate)) {
      throw new ValidationError('Stage endDate must be >= startDate')
    }

    const status = updates.status ?? currentData.status
    const pauseReason = updates.pauseReason ?? currentData.pauseReason

    if (!validatePauseReason(status, pauseReason)) {
      throw new ValidationError('Pause reason is required when stage status is paused')
    }

    await updateDoc(stageRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error
    }
    throw new FirebaseError(
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
    const db = getFirestoreInstance()
    const stageRef = doc(db, PROJECTS_COLLECTION, projectId, 'stages', stageId)

    // Check if stage exists
    const snapshot = await getDoc(stageRef)
    if (!snapshot.exists()) {
      throw new NotFoundError(`Stage with id ${stageId} not found`)
    }

    await deleteDoc(stageRef)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new FirebaseError(
      `Failed to delete stage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error.name : undefined
    )
  }
}
