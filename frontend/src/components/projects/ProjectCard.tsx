import React from 'react'
import { Project } from '../../models/project'
import { Stage } from '../../models/stage'
import { Task } from '../../models/task'
import { ProgressBar } from '../timeline/ProgressBar'
import { calculateStageProgress } from '../../utils/progressCalculator'
import './ProjectCard.css'

interface ProjectCardProps {
  project: Project
  stages: Stage[]
  tasks: Task[]
  onClick?: (project: Project) => void
  isSelected?: boolean
  className?: string
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  stages,
  tasks,
  onClick,
  isSelected = false,
  className = '',
}) => {
  // Calculate overall project progress (average of all stages)
  const isProjectFullyCompleted =
    stages.length > 0 && stages.every((s) => s.status === 'completed')
  const stagesProgress = stages.map((stage) => calculateStageProgress(stage, tasks))
  const overallProgress =
    stagesProgress.length > 0
      ? stagesProgress.reduce((sum, p) => sum + p, 0) / stagesProgress.length
      : 0

  return (
    <div className={`project-item ${className}`}>
      <div className={`project-name ${isSelected ? 'project-name-selected' : ''}`}>{project.name}</div>
      <div className="project-timeline">
        {stages.map((stage) => {
          const stageProgress = calculateStageProgress(stage, tasks)
          const stageTasks = tasks.filter(
            (task) => task.stageId === stage.id || task.group_id === Number(stage.kaitenGroupId)
          )
          const completedCount = stageTasks.filter((t) => t.isCompleted).length
          const totalCount = stageTasks.length

          return (
            <div
              key={stage.id}
              className="project-timeline-row"
              onClick={() => onClick?.(project)}
              style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
              <ProgressBar
                progress={stageProgress}
                stageName={stage.name}
                taskCount={totalCount}
                isPaused={stage.status === 'paused'}
                isCompleted={stage.status === 'completed'}
                isProjectFullyCompleted={isProjectFullyCompleted}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
