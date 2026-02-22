// Task model - represents task from Kaiten API (read-only)
// Tasks are not stored in Firebase, only cached locally

export interface KaitenTaskStatus {
  id: number
  name: string
  is_closed: boolean
}

export interface KaitenTask {
  id: number
  title: string
  status: KaitenTaskStatus
  group_id: number
  board_id: number
  created_at: string
  updated_at: string
}

// Task with computed fields for application use
export interface Task extends KaitenTask {
  isCompleted: boolean
  stageId?: string
}

/** Проверка, что статус/состояние означает «завершено» в Kaiten */
function isCompletedStatus(
  rawStatus: unknown,
  card: { state_id?: number; state?: string; states?: unknown }
): boolean {
  // 1) Объект status с is_closed или closed
  if (typeof rawStatus === 'object' && rawStatus !== null) {
    const s = rawStatus as { is_closed?: boolean; closed?: boolean; name?: string; title?: string }
    if (s.is_closed === true || s.closed === true) return true
    const name = (s.name ?? s.title ?? '').toString().toLowerCase().trim()
    const completedNames = ['завершена', 'завершено', 'completed', 'готово', 'done', 'closed', 'выполнена', 'закрыта', 'closed']
    if (completedNames.some((n) => name === n || name.includes(n))) return true
  }

  // 2) state_id: в Kaiten часто 3 = done (1-queued, 2-inProgress, 3-done)
  if (card.state_id === 3) return true
  const stateStr = (card.state ?? '').toString().toLowerCase()
  if (stateStr === 'done' || stateStr === 'завершено' || stateStr === '3') return true

  return false
}

// Map Kaiten API response to Task
export const mapKaitenTaskToTask = (
  kaitenTask: KaitenTask,
  stageId?: string
): Task => {
  const card = kaitenTask as KaitenTask & { state_id?: number; state?: string; lane_id?: number }
  const rawStatus = (kaitenTask as { status?: unknown }).status

  const status = (typeof rawStatus === 'object' && rawStatus !== null)
    ? {
        id: (rawStatus as { id?: number }).id ?? 0,
        name: ((rawStatus as { name?: string }).name ?? (rawStatus as { title?: string }).title ?? 'Unknown').toString(),
        is_closed: (rawStatus as { is_closed?: boolean }).is_closed === true || (rawStatus as { closed?: boolean }).closed === true,
      }
    : { id: 0, name: 'Unknown', is_closed: false }

  const isCompleted = status.is_closed === true || isCompletedStatus(rawStatus, card)

  // group_id может прийти как lane_id в части API
  const groupId = (kaitenTask as { group_id?: number }).group_id ?? card.lane_id ?? (kaitenTask as { group?: { id?: number } }).group?.id
  const taskForSpread = { ...kaitenTask }
  if (groupId != null && taskForSpread.group_id == null) {
    (taskForSpread as { group_id: number }).group_id = Number(groupId)
  }

  return {
    ...taskForSpread,
    status,
    isCompleted,
    stageId,
  }
}

// Map array of Kaiten tasks to Tasks
export const mapKaitenTasksToTasks = (
  kaitenTasks: KaitenTask[],
  stageId?: string
): Task[] => {
  return kaitenTasks.map((task) => mapKaitenTaskToTask(task, stageId))
}

/**
 * Сортировка для отображения: сначала в работе, затем выполненные.
 * Выполненные — в порядке выполнения (последняя выполненная выше).
 * Используется updated_at из Kaiten как приближение времени завершения.
 */
export const sortTasksForDisplay = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
    if (a.isCompleted && b.isCompleted) {
      const timeA = new Date(a.updated_at).getTime()
      const timeB = new Date(b.updated_at).getTime()
      return timeB - timeA
    }
    return 0
  })
}