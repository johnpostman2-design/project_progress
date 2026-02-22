import { Project } from '../../models/project'
import { Stage } from '../../models/stage'
import { Task, mapKaitenTasksToTasks } from '../../models/task'
import { KaitenCard, KaitenConfig } from '../kaiten/kaitenTypes'
import { getCardsByBoard } from '../kaiten/kaitenApi'
import { getStages } from '../supabase/supabaseService'

/**
 * Sync tasks from Kaiten for a project
 * Returns all tasks for all stages of the project
 */
export const syncProjectTasks = async (
  project: Project,
  config: KaitenConfig
): Promise<Task[]> => {
  if (!project.kaitenBoardId) {
    throw new Error(`Project ${project.id} has no kaitenBoardId`)
  }

  const boardId = Number(project.kaitenBoardId)
  if (isNaN(boardId)) {
    throw new Error(`Invalid kaitenBoardId: ${project.kaitenBoardId}`)
  }

  // Get all cards from Kaiten for this board
  const kaitenCards: KaitenCard[] = await getCardsByBoard(boardId, config)
  
  // Ensure kaitenCards is an array
  if (!Array.isArray(kaitenCards)) {
    console.error('[syncService] getCardsByBoard returned non-array:', kaitenCards)
    return []
  }

  // Get stages for this project
  const stages = await getStages(project.id)

  // Map Kaiten cards to Tasks with stageId
  const tasks: Task[] = []
  for (const card of kaitenCards) {
    // Skip invalid cards
    if (!card || !card.id) {
      console.warn('[syncService] Skipping invalid card:', card)
      continue
    }
    // group_id может быть в card.group_id, card.group?.id или card.lane_id (в зависимости от формата API)
    const cardGroupId = card.group_id ?? (card as { group?: { id?: number }; lane_id?: number }).group?.id ?? (card as { lane_id?: number }).lane_id
    const groupIdStr = cardGroupId != null ? String(cardGroupId) : undefined

    const stage = groupIdStr ? stages.find((s) => s.kaitenGroupId != null && String(s.kaitenGroupId) === groupIdStr) : undefined
    const stageId = stage?.id != null ? String(stage.id) : undefined

    // Чтобы UI (TimelineRow и др.) мог сопоставлять по group_id, гарантируем его в карточке
    const cardWithGroup = cardGroupId != null && (card as { group_id?: number }).group_id == null
      ? { ...card, group_id: Number(cardGroupId) }
      : card

    try {
    // Map Kaiten card to Task
    const task = mapKaitenTasksToTasks([cardWithGroup], stageId)[0]
    tasks.push(task)
    } catch (error) {
      console.error('[syncService] Error mapping card to task:', error, card)
      // Continue with other cards even if one fails
    }
  }

  return tasks
}

/**
 * Sync tasks for a specific stage
 */
export const syncStageTasks = async (
  stage: Stage,
  config: KaitenConfig
): Promise<Task[]> => {
  const groupId = Number(stage.kaitenGroupId)
  if (isNaN(groupId)) {
    throw new Error(`Invalid kaitenGroupId: ${stage.kaitenGroupId}`)
  }

  // Get project to find boardId
  // For now, we'll need boardId passed separately or get it from stage
  // This is a simplified version - in real implementation, we'd need boardId
  throw new Error('syncStageTasks requires boardId - use syncProjectTasks instead')
}
