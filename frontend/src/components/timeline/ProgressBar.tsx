import React from 'react'
import { Icon32Pause } from '../common/icons/Icon32Pause'
import { Icon16Check } from '../common/icons/Icon16Check'
import './ProgressBar.css'

interface ProgressBarProps {
  progress: number // 0-100
  stageName?: string
  taskCount?: number
  isPaused?: boolean
  isCompleted?: boolean
  isProjectFullyCompleted?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  stageName = 'Proto',
  taskCount = 12,
  isPaused = false,
  isCompleted = false,
  isProjectFullyCompleted = false,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  const showProjectCompleted = isCompleted && isProjectFullyCompleted

  return (
    <div
      className={`progress-bar ${isPaused ? 'paused' : ''} ${isCompleted ? 'completed' : ''} ${showProjectCompleted ? 'progress-bar-project-completed' : ''} ${className}`}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-bar-fill"
        style={{ width: `${clampedProgress}%` }}
      />
      <div className="progress-bar-content">
        <span>{stageName}</span>
        <span> ∙ {taskCount}</span>
      </div>
      {isCompleted && (
        <div className="progress-bar-icon progress-bar-icon-check">
          <Icon16Check />
        </div>
      )}
      {isPaused && (
        <div className="progress-bar-icon">
          <Icon32Pause />
        </div>
      )}
    </div>
  )
}
