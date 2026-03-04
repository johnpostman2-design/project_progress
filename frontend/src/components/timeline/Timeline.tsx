import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Stage } from '../../models/stage'
import { Task } from '../../models/task'
import { Project } from '../../models/project'
import { calculateTimelineLayout, TimelineRow as TimelineRowType } from '../../utils/timelineLayout'
import { TimelineRow } from './TimelineRow'
import { TodayPointer } from './TodayPointer'
import { formatDateShort } from '../../utils/dateUtils'
import './Timeline.css'

const MS_PER_DAY = 1000 * 60 * 60 * 24

interface TimelineProps {
  stages: Stage[]
  tasks: Task[]
  project?: Project // Проект с датами начала и окончания
  /** id этапа, открытого в сайдбаре — ячейка этого этапа подсвечивается в таймлайне */
  selectedStageId?: string | null
  onStageClick?: (stage: Stage) => void
  onTitleClick?: () => void // Клик на заголовок таймлайна
  sequential?: boolean // Если true, все этапы в одной строке последовательно
  /** Показывать у отсечки дату вместо маячка (при hover/выборе таймлайна) */
  isHovered?: boolean
  isSelected?: boolean
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
  isHovered = false,
  isSelected = false,
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

  // Позиция отсечки «сегодня» по горизонтали (Figma 577:13942)
  const todayPointer = useMemo(() => {
    if (layout.rows.length === 0 || containerWidth <= 0) return null
    const start = layout.projectStartDate
    const end = layout.projectEndDate
    if (end <= start) return null
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    if (todayStart < start || todayStart > end) return null
    const ratio = (todayStart - start) / (end - start)
    const todayX = ratio * containerWidth
    const dateLabel = formatDateShort(new Date(todayStart))
    return { todayX, dateLabel }
  }, [layout.rows.length, layout.projectStartDate, layout.projectEndDate, containerWidth])

  const showDateOnPointer = isHovered || isSelected

  return (
    <div 
      ref={containerRef}
      className={`timeline ${className}`} 
      style={{ flex: 1, minWidth: 0, width: '100%', position: 'relative' }}
    >
      {todayPointer != null && (
        <div
          className="timeline-today-pointer-wrapper"
          style={{
            position: 'absolute',
            left: todayPointer.todayX,
            top: 0,
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 1,
            minWidth: 1,
            overflow: 'visible',
            zIndex: 10,
          }}
        >
          <TodayPointer
            showDateLabel={showDateOnPointer}
            dateLabel={todayPointer.dateLabel}
          />
        </div>
      )}
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
