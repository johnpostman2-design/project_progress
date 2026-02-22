import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Stage } from '../../models/stage'
import { Task } from '../../models/task'
import { Project } from '../../models/project'
import { calculateTimelineLayout, TimelineRow as TimelineRowType } from '../../utils/timelineLayout'
import { TimelineRow } from './TimelineRow'
import './Timeline.css'

interface TimelineProps {
  stages: Stage[]
  tasks: Task[]
  project?: Project // Проект с датами начала и окончания
  /** id этапа, открытого в сайдбаре — ячейка этого этапа подсвечивается в таймлайне */
  selectedStageId?: string | null
  onStageClick?: (stage: Stage) => void
  onTitleClick?: () => void // Клик на заголовок таймлайна
  sequential?: boolean // Если true, все этапы в одной строке последовательно
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({
  stages,
  tasks,
  project,
  selectedStageId = null,
  onStageClick,
  onTitleClick,
  sequential = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Отслеживаем размер контейнера для респонсивности
  useEffect(() => {
    if (!containerRef.current) {
      // Устанавливаем начальную ширину, если контейнер еще не готов
      setContainerWidth(1000) // Дефолтная ширина
      return
    }

    // Устанавливаем начальную ширину сразу
    setContainerWidth(containerRef.current.offsetWidth || 1000)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        setContainerWidth(w > 0 ? w : 0)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Используем даты проекта для расчета масштаба, если они есть
  const projectStartDate = project?.startDate?.toMillis()
  const projectEndDate = project?.endDate?.toMillis()

  // Memoize layout calculation for performance
  const layout = useMemo(() => {
    return calculateTimelineLayout(
      stages, 
      sequential, 
      containerWidth > 0 ? containerWidth : undefined,
      projectStartDate,
      projectEndDate
    )
  }, [stages, sequential, containerWidth, projectStartDate, projectEndDate])

  const isProjectFullyCompleted =
    stages.length > 0 && stages.every((s) => s.status === 'completed')

  return (
    <div 
      ref={containerRef}
      className={`timeline ${className}`} 
      style={{ flex: 1, minWidth: 0, width: '100%' }}
    >
      {layout.rows.map((row: TimelineRowType, index: number) => (
        <TimelineRow
          key={index}
          stages={row.stages}
          tasks={tasks}
          offset={row.offset}
          projectStartDate={layout.projectStartDate}
          projectEndDate={layout.projectEndDate}
          pixelsPerDay={layout.pixelsPerDay}
          containerWidth={containerWidth}
          selectedStageId={selectedStageId}
          onStageClick={onStageClick}
          isProjectFullyCompleted={isProjectFullyCompleted}
        />
      ))}
    </div>
  )
}
