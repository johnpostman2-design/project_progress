import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Stage } from '../../models/stage'
import { Task } from '../../models/task'
import { ProgressBar } from './ProgressBar'
import { calculateStageProgress } from '../../utils/progressCalculator'
import { formatDateShort } from '../../utils/dateUtils'

const MS_PER_DAY = 1000 * 60 * 60 * 24

interface TimelineRowProps {
  stages: Stage[]
  tasks: Task[]
  offset: number
  projectStartDate: number // Project start date in milliseconds
  projectEndDate: number // Project end date in milliseconds
  pixelsPerDay: number // Scale (kept for layout compat, not used for width)
  containerWidth: number // Container width (kept for compat)
  selectedStageId?: string | null
  onStageClick?: (stage: Stage) => void
  isProjectFullyCompleted?: boolean
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  stages,
  tasks,
  projectStartDate,
  projectEndDate,
  selectedStageId = null,
  onStageClick,
  isProjectFullyCompleted = false,
}) => {
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null)
  const [tooltipRect, setTooltipRect] = useState<{ left: number; top: number; width: number } | null>(null)
  const [tooltipStage, setTooltipStage] = useState<{ startLabel: string; endLabel: string } | null>(null)
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const updateTooltipPosition = (stageId: string) => {
    const el = cellRefs.current[stageId]
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTooltipRect({ left: rect.left, top: rect.top, width: rect.width })
  }

  useEffect(() => {
    if (!hoveredStageId && !selectedStageId) {
      setTooltipRect(null)
      setTooltipStage(null)
      return
    }
    const stageId = hoveredStageId ?? selectedStageId ?? null
    if (!stageId) return
    const stage = stages.find((s) => s.id === stageId)
    if (!stage) return
    const startLabel = formatDateShort(stage.startDate)
    const endLabel = formatDateShort(stage.endDate)
    if (!startLabel && !endLabel) return
    setTooltipStage({ startLabel, endLabel })
    requestAnimationFrame(() => updateTooltipPosition(stageId))
  }, [hoveredStageId, selectedStageId, stages])

  useEffect(() => {
    if (!tooltipRect || (!hoveredStageId && !selectedStageId)) return
    const stageId = hoveredStageId ?? selectedStageId!
    const onScrollOrResize = () => updateTooltipPosition(stageId)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [tooltipRect, hoveredStageId, selectedStageId])

  // Сетка: каждая колонка = 1 день. Левый отступ — дни от старта проекта до первого этапа в строке.
  const offsetDays =
    stages.length > 0
      ? Math.max(0, (stages[0].startDate.toMillis() - projectStartDate) / MS_PER_DAY)
      : 0

  // Правый отступ — дни от конца последнего этапа в строке до конца проекта (чтобы ширина строки = вся длительность проекта).
  const rowEndMs =
    stages.length > 0
      ? Math.max(...stages.map((s) => s.endDate.toMillis()))
      : projectEndDate
  const rightSpacerDays = Math.max(
    0,
    (projectEndDate - rowEndMs) / MS_PER_DAY
  )

  return (
    <div className="timeline-row">
      {offsetDays > 0 && (
        <div
          className="timeline-row-spacer"
          style={{ flex: offsetDays, minWidth: 0 }}
          aria-hidden
        />
      )}
      {stages.map((stage, index) => {
        const stageProgress = calculateStageProgress(stage, tasks)
        const stageTasks = tasks.filter((task) => {
          if (task.stageId != null && task.stageId === stage.id) return true
          if (task.group_id != null && stage.kaitenGroupId != null && String(task.group_id) === String(stage.kaitenGroupId)) return true
          return false
        })
        const totalCount = stageTasks.length
        const stageStart = stage.startDate.toMillis()
        const stageEnd = stage.endDate.toMillis()
        const durationDays = Math.max(
          0.001,
          (stageEnd - stageStart) / MS_PER_DAY
        )

        const isHovered = hoveredStageId === stage.id
        const isSelected = selectedStageId != null && stage.id === selectedStageId
        const startLabel = formatDateShort(stage.startDate)
        const endLabel = formatDateShort(stage.endDate)

        return (
          <div
            key={stage.id}
            ref={(el) => { cellRefs.current[stage.id] = el }}
            className={`timeline-row-cell ${isHovered ? 'timeline-row-cell-hover' : ''} ${isSelected ? 'timeline-row-cell-selected' : ''}`}
            style={{ flex: durationDays, position: 'relative' }}
            onClick={(e) => {
              e.stopPropagation()
              onStageClick?.(stage)
            }}
            role={onStageClick ? 'button' : undefined}
            tabIndex={onStageClick ? 0 : undefined}
            onMouseEnter={() => setHoveredStageId(stage.id)}
            onMouseLeave={() => setHoveredStageId(null)}
            onKeyDown={
              onStageClick
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onStageClick(stage)
                    }
                  }
                : undefined
            }
          >
            {tooltipRect && tooltipStage && (hoveredStageId === stage.id || (selectedStageId === stage.id && !hoveredStageId)) ? createPortal(
              <div
                className="timeline-cell-tooltip timeline-cell-tooltip-portal"
                style={{
                  position: 'fixed',
                  left: tooltipRect.left,
                  top: tooltipRect.top - 24,
                  width: tooltipRect.width,
                  boxSizing: 'border-box',
                  zIndex: 9999,
                }}
                aria-hidden
              >
                {tooltipStage.startLabel ? <span className="timeline-cell-tooltip-date timeline-cell-tooltip-start">{tooltipStage.startLabel}</span> : null}
                {tooltipStage.endLabel ? <span className="timeline-cell-tooltip-date timeline-cell-tooltip-end">{tooltipStage.endLabel}</span> : null}
              </div>,
              document.body
            ) : null}
            <ProgressBar
              progress={stageProgress}
              stageName={stage.name}
              taskCount={totalCount}
              isPaused={stage.status === 'paused'}
              isCompleted={stage.status === 'completed'}
              isProjectFullyCompleted={isProjectFullyCompleted}
              className={index === stages.length - 1 ? 'progress-bar-last' : ''}
            />
          </div>
        )
      })}
      {rightSpacerDays > 0 && (
        <div
          className="timeline-row-spacer"
          style={{ flex: rightSpacerDays, minWidth: 0 }}
          aria-hidden
        />
      )}
    </div>
  )
}
