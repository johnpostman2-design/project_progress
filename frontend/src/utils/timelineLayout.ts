import { Stage } from '../models/stage'

export interface TimelineRow {
  stages: Stage[]
  offset: number // Visual offset in pixels
}

export interface TimelineLayoutInfo {
  rows: TimelineRow[]
  projectStartDate: number // Project start date in milliseconds
  projectEndDate: number // Project end date in milliseconds
  pixelsPerDay: number // Scale for converting days to pixels
}

/**
 * Calculate timeline layout for parallel stages.
 * Этапы обрабатываются по порядку (по дате начала). Если даты этапа совпадают или
 * частично пересекаются с любым этапом в текущей строке — этап переносится на строку ниже.
 * Та же логика применяется ко всем следующим этапам.
 * Строка смещается вправо по оси времени по самой ранней дате начала этапов в этой строке.
 * 
 * @param stages - Array of stages to layout
 * @param sequential - If true, all stages go in one row sequentially (for preview)
 * @param containerWidth - Available width for timeline in pixels (optional, for responsive scaling)
 * @param projectStartDate - Project start date in milliseconds (optional, from project)
 * @param projectEndDate - Project end date in milliseconds (optional, from project)
 */
export const calculateTimelineLayout = (
  stages: Stage[], 
  sequential: boolean = false,
  containerWidth?: number,
  projectStartDate?: number,
  projectEndDate?: number
): TimelineLayoutInfo => {
  if (stages.length === 0) {
    const now = Date.now()
    return {
      rows: [],
      projectStartDate: now,
      projectEndDate: now,
      pixelsPerDay: 165,
    }
  }

  // Sort stages by start date to ensure sequential order
  const sortedStages = [...stages].sort((a, b) => {
    const aStart = a.startDate.toMillis()
    const bStart = b.startDate.toMillis()
    return aStart - bStart
  })

  // Определяем даты проекта: используем переданные даты проекта или вычисляем из этапов
  const calculatedStartDate = sortedStages.length > 0 
    ? sortedStages[0].startDate.toMillis()
    : Date.now()
  const calculatedEndDate = sortedStages.length > 0
    ? Math.max(...sortedStages.map(s => s.endDate.toMillis()))
    : Date.now()

  const finalStartDate = projectStartDate || calculatedStartDate
  const finalEndDate = projectEndDate || calculatedEndDate

  // Если sequential, все этапы в одной строке
  if (sequential) {
    const totalDays = (finalEndDate - finalStartDate) / (1000 * 60 * 60 * 24)
    const BASE_PIXELS_PER_DAY = 165
    const pixelsPerDay = containerWidth && totalDays > 0
      ? Math.max(50, Math.min(BASE_PIXELS_PER_DAY, (containerWidth * 0.9) / totalDays))
      : BASE_PIXELS_PER_DAY

    return {
      rows: [{
      stages: sortedStages,
      offset: 0,
      }],
      projectStartDate: finalStartDate,
      projectEndDate: finalEndDate,
      pixelsPerDay,
    }
  }

  // Calculate total project duration in days
  const totalDays = (finalEndDate - finalStartDate) / (1000 * 60 * 60 * 24)
  
  // Adaptive scale: pixels per day based on container width
  // Base scale: ~165px per day for desktop
  // If containerWidth is provided, scale proportionally to fit 90% of container
  const BASE_PIXELS_PER_DAY = 165
  const PIXELS_PER_DAY = containerWidth && totalDays > 0
    ? Math.max(50, Math.min(BASE_PIXELS_PER_DAY, (containerWidth * 0.9) / totalDays)) // 90% of container, min 50px/day
    : BASE_PIXELS_PER_DAY

  const rows: TimelineRow[] = []

  for (const stage of sortedStages) {
    const stageStart = stage.startDate.toMillis()
    const stageEnd = stage.endDate.toMillis()

    // Try to place stage in the last row (to maintain sequential order)
    // If it overlaps with ANY stage in the last row, create a new row
    let placed = false
    
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1]
      
      // Check if stage overlaps with ANY stage in the last row
      const hasOverlap = lastRow.stages.some((existingStage) => {
        const existingStart = existingStage.startDate.toMillis()
        const existingEnd = existingStage.endDate.toMillis()

        // Check if date ranges overlap
        // Two ranges overlap if: start1 <= end2 && start2 <= end1
        return stageStart <= existingEnd && existingStart <= stageEnd
      })

      // If no overlap, add to the last row (maintains sequential order)
      if (!hasOverlap) {
        lastRow.stages.push(stage)
        placed = true
      }
    }

    // If no rows exist or stage overlaps with the last row, create a new row
    if (!placed) {
      rows.push({
        stages: [stage],
        offset: 0, // Will be calculated after all stages are placed
      })
    }
  }

  // Calculate offset for each row based on the earliest stage start date in that row
  for (const row of rows) {
    if (row.stages.length === 0) continue

    // Find the earliest start date in this row
    const rowEarliestStart = Math.min(...row.stages.map(s => s.startDate.toMillis()))
    
    // Calculate offset in days from the project's start date
    const daysDiff = (rowEarliestStart - finalStartDate) / (1000 * 60 * 60 * 24)
    
    // Convert days to pixels
    row.offset = Math.round(daysDiff * PIXELS_PER_DAY)
  }

  // Stages are already sorted by start date, but ensure they're sorted within each row
  for (const row of rows) {
    row.stages.sort((a, b) => {
      const aStart = a.startDate.toMillis()
      const bStart = b.startDate.toMillis()
      return aStart - bStart
    })
  }

  return {
    rows,
    projectStartDate: finalStartDate,
    projectEndDate: finalEndDate,
    pixelsPerDay: PIXELS_PER_DAY,
  }
}
