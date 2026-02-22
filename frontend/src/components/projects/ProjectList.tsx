import React from 'react'
import { Project } from '../../models/project'
import { Stage } from '../../models/stage'
import { Task } from '../../models/task'
import { ProjectCard } from './ProjectCard'
import './ProjectCard.css'

interface ProjectListProps {
  projects: Project[]
  stagesMap: Record<string, Stage[]> // projectId -> stages
  tasksMap: Record<string, Task[]> // projectId -> tasks
  onProjectClick?: (project: Project) => void
  selectedProjectId?: string | null
  className?: string
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  stagesMap,
  tasksMap,
  onProjectClick,
  selectedProjectId,
  className = '',
}) => {
  return (
    <div className={`projects-list ${className}`}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          stages={stagesMap[project.id] || []}
          tasks={tasksMap[project.id] || []}
          onClick={onProjectClick}
          isSelected={selectedProjectId === project.id}
        />
      ))}
    </div>
  )
}
