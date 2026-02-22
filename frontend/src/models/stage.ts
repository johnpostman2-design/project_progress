import { Timestamp } from 'firebase/firestore'

export type StageStatus = 'active' | 'paused' | 'completed'

export interface Stage {
  id: string
  projectId: string
  name: string
  startDate: Timestamp
  endDate: Timestamp
  status: StageStatus
  pauseReason?: string
  kaitenGroupId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface StageInput {
  name: string
  startDate?: Date
  endDate?: Date
  status?: StageStatus
  pauseReason?: string
  kaitenGroupId: string
}

// Validation rules
export const validateStageName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 200
}

export const validateStageDates = (
  startDate: Timestamp | Date,
  endDate: Timestamp | Date
): boolean => {
  const start = startDate instanceof Timestamp ? startDate.toDate() : startDate
  const end = endDate instanceof Timestamp ? endDate.toDate() : endDate

  return end >= start
}

export const validatePauseReason = (
  status: StageStatus,
  pauseReason?: string
): boolean => {
  if (status === 'paused') {
    return pauseReason !== undefined && pauseReason.trim().length > 0
  }
  return true
}

// State transition functions
export const canPauseStage = (stage: Stage): boolean => {
  return stage.status === 'active'
}

export const canResumeStage = (stage: Stage): boolean => {
  return stage.status === 'paused'
}

export const canCompleteStage = (stage: Stage): boolean => {
  return stage.status === 'active' || stage.status === 'paused'
}

export const canReactivateStage = (stage: Stage): boolean => {
  return stage.status === 'completed'
}

export const pauseStage = (stage: Stage, reason: string): Stage => {
  if (!canPauseStage(stage)) {
    throw new Error(`Cannot pause stage with status: ${stage.status}`)
  }
  if (!reason || reason.trim().length === 0) {
    throw new Error('Pause reason is required')
  }
  return {
    ...stage,
    status: 'paused',
    pauseReason: reason,
    updatedAt: Timestamp.now(),
  }
}

export const resumeStage = (stage: Stage): Stage => {
  if (!canResumeStage(stage)) {
    throw new Error(`Cannot resume stage with status: ${stage.status}`)
  }
  return {
    ...stage,
    status: 'active',
    pauseReason: undefined,
    updatedAt: Timestamp.now(),
  }
}

export const completeStage = (stage: Stage): Stage => {
  if (!canCompleteStage(stage)) {
    throw new Error(`Cannot complete stage with status: ${stage.status}`)
  }
  return {
    ...stage,
    status: 'completed',
    pauseReason: undefined,
    updatedAt: Timestamp.now(),
  }
}

export const reactivateStage = (stage: Stage): Stage => {
  if (!canReactivateStage(stage)) {
    throw new Error(`Cannot reactivate stage with status: ${stage.status}`)
  }
  return {
    ...stage,
    status: 'active',
    pauseReason: undefined,
    updatedAt: Timestamp.now(),
  }
}
