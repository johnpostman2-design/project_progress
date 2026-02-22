import { Project } from '../../models/project'
import { Stage } from '../../models/stage'

export class FirebaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'FirebaseError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type StageInput = Omit<Stage, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
