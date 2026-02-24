import { Stage } from '../models/stage'
import { Task } from '../models/task'

/**
 * Calculate stage progress based on task completion status
 * Formula: progress = (completedTasksCount / totalTasksCount) * 100
 *
 * @param stage - Stage to calculate progress for
 * @param tasks - Array of tasks for this stage
 * @returns Progress percentage (0-100)
 */
export const calculateStageProgress = (
  stage: Stage,
  tasks: Task[]
): number => {
  // Filter tasks for this stage (сопоставление по stageId или group_id/kaitenGroupId)
  const stageTasks = tasks.filter((task) => {
    if (task.stageId != null && task.stageId === stage.id) return true
    if (task.group_id != null && stage.kaitenGroupId != null && String(task.group_id) === String(stage.kaitenGroupId)) return true
    return false
  })

  // Edge case: no tasks
  if (stageTasks.length === 0) {
    return 0
  }

  // Count completed tasks (status name === "Завершена")
  const completedTasksCount = stageTasks.filter(
    (task) => task.isCompleted
  ).length

  // Count total tasks (tasks without status are counted as not completed)
  const totalTasksCount = stageTasks.length

  // Edge case: all tasks completed
  if (completedTasksCount === totalTasksCount) {
    return 100
  }

  // Calculate progress percentage
  const progress = (completedTasksCount / totalTasksCount) * 100

  // Round to 2 decimal places
  return Math.round(progress * 100) / 100
}

/**
 * Count completed tasks for a stage
 */
export const getCompletedTasksCount = (tasks: Task[], stageId: string): number => {
  const stageTasks = tasks.filter(
    (task) => task.stageId === stageId || task.group_id === Number(stageId)
  )
  return stageTasks.filter(
    (task) => task.isCompleted
  ).length
}

/**
 * Count total tasks for a stage
 */
export const getTotalTasksCount = (tasks: Task[], stageId: string): number => {
  return tasks.filter(
    (task) => task.stageId === stageId || task.group_id === Number(stageId)
  ).length
}

/** Задачи этапа (сопоставление по stageId или group_id / kaitenGroupId) */
function getStageTasks(stage: Stage, tasks: Task[]): Task[] {
  return tasks.filter((task) => {
    if (task.stageId != null && task.stageId === stage.id) return true
    if (task.group_id != null && stage.kaitenGroupId != null && String(task.group_id) === String(stage.kaitenGroupId)) return true
    return false
  })
}

/**
 * Этап считается завершённым, если: статус этапа = completed ИЛИ в этапе есть задачи и все они выполнены.
 */
export const isStageEffectivelyCompleted = (stage: Stage, tasks: Task[]): boolean => {
  if (stage.status === 'completed') return true
  const stageTasks = getStageTasks(stage, tasks)
  return stageTasks.length > 0 && stageTasks.every((t) => t.isCompleted)
}
