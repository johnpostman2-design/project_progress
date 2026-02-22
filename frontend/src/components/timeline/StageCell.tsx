import React, { useState } from 'react'
import { Stage } from '../../models/stage'
import { Task } from '../../models/task'
import { calculateStageProgress } from '../../utils/progressCalculator'

interface StageCellProps {
  stage: Stage
  tasks: Task[]
  onClick?: (stage: Stage) => void
  className?: string
}

export const StageCell: React.FC<StageCellProps> = ({
  stage,
  tasks,
  onClick,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const progress = calculateStageProgress(stage, tasks)

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('ru-RU')
  }

  const startDate = formatDate(stage.startDate)
  const endDate = formatDate(stage.endDate)

  return (
    <div
      className={`stage-cell ${className}`}
      onClick={() => onClick?.(stage)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative' }}
    >
      <div className="stage-cell-content">
        <div className="stage-cell-name">{stage.name}</div>
        <div className="stage-cell-progress" style={{ width: `${progress}%` }} />
      </div>
      {showTooltip && (
        <div className="stage-cell-tooltip">
          <div>Начало: {startDate}</div>
          <div>Окончание: {endDate}</div>
          <div>Прогресс: {progress.toFixed(0)}%</div>
        </div>
      )}
    </div>
  )
}
