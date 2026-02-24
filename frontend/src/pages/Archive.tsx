import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useArchivedCount } from '../hooks/useArchivedCount'
import { Project } from '../models/project'
import { Stage } from '../models/stage'
import { Task } from '../models/task'
import { ProjectSidebar } from '../components/projects/ProjectSidebar'
import { Timeline } from '../components/timeline/Timeline'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { updateProject, deleteProject, getStages } from '../services/supabase/supabaseService'
import { restoreProject } from '../models/project'
import { isStageEffectivelyCompleted } from '../utils/progressCalculator'
import { useKaitenSync } from '../hooks/useKaitenSync'
import { KaitenConfig } from '../services/kaiten/kaitenTypes'
import { DeleteToast, type DeleteToastRef } from '../components/common/DeleteToast'
import { Button } from '../components/common/Button'
import { Icon } from '../components/ui/Icon'
import './Archive.css'

export const Archive: React.FC = () => {
  const navigate = useNavigate()
  const { projects, loading, refetch } = useProjects(true)
  const { refetch: refetchArchivedCount } = useArchivedCount()
  const archivedProjects = projects.filter((p) => p.status === 'archived')

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [stagesMap, setStagesMap] = useState<Record<string, Stage[]>>({})
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [showSidebar, setShowSidebar] = useState(false)
  const deleteToastRef = React.useRef<DeleteToastRef>(null)

  const [kaitenConfig, setKaitenConfigState] = useState<KaitenConfig | null>(null)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kaitenConfig')
      if (stored) {
        const parsed = JSON.parse(stored) as KaitenConfig
        if (parsed?.domain) {
          setKaitenConfigState({ domain: parsed.domain, boardId: parsed.boardId, spaceId: parsed.spaceId })
        }
      }
    } catch (_e) {}
  }, [])
  const { syncProject } = useKaitenSync(kaitenConfig)

  useEffect(() => {
    if (archivedProjects.length === 0) return
    const loadStages = async () => {
      const map: Record<string, Stage[]> = {}
      for (const p of archivedProjects) {
        const st = await getStages(p.id)
        map[p.id] = st
      }
      setStagesMap(map)
    }
    loadStages()
  }, [archivedProjects.length])

  useEffect(() => {
    if (archivedProjects.length === 0 || !kaitenConfig) return
    const loadTasks = async () => {
      const map: Record<string, Task[]> = { ...tasks }
      for (const p of archivedProjects) {
        if (p.kaitenBoardId) {
          try {
            const t = await syncProject(p)
            map[p.id] = t
          } catch {
            map[p.id] = map[p.id] || []
          }
        } else {
          map[p.id] = map[p.id] || []
        }
      }
      setTasks(map)
    }
    loadTasks()
  }, [archivedProjects.length, kaitenConfig?.domain])

  const displayTasks = useMemo(() => tasks, [tasks])

  const handleRestore = async () => {
    if (!selectedProject) return
    try {
      const restored = restoreProject(selectedProject)
      await updateProject(selectedProject.id, { status: restored.status })
      setSelectedProject(null)
      setSelectedStage(null)
      setShowSidebar(false)
      await refetch()
      await refetchArchivedCount()
    } catch (error) {
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = (project: Project) => {
    setSelectedProject((prev) => (prev?.id === project.id ? null : prev))
    setSelectedStage(null)
    setShowSidebar(false)

    deleteToastRef.current?.show(
      project.name,
      () => {
        refetch()
        refetchArchivedCount()
      },
      async () => {
        try {
          await deleteProject(project.id)
          await refetch()
          await refetchArchivedCount()
        } catch (error) {
          alert(`Ошибка удаления: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    )
  }

  if (loading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <div className="archive">
      <div className="archive-main">
        <div className={`archive-header ${selectedProject && showSidebar ? 'archive-header-sidebar-open' : ''}`}>
          <Button
            type="text"
            size="small"
            onClick={() => navigate('/dashboard')}
            className="archive-header-back"
          >
            <Icon name="arrow-left" size={16} className="archive-header-back-icon" />
          </Button>
          <h1 className="archive-header-title">Архив</h1>
        </div>
        <div className={`archive-content ${selectedProject && showSidebar ? 'archive-content-sidebar-open' : ''}`}>
          {archivedProjects.length === 0 ? (
            <div className="archive-empty-state">
              <p className="archive-empty-state-text">В архиве нет проектов</p>
            </div>
          ) : (
            <div className="archive-projects-timelines">
              {archivedProjects.map((project) => {
                const projectStages = stagesMap[project.id] || []
                const projectTasks = displayTasks[project.id] || []
                const isProjectFullyCompleted =
                  projectStages.length > 0 && projectStages.every((s) => isStageEffectivelyCompleted(s, projectTasks))
                return (
                  <div key={project.id} className="archive-project-timeline-wrapper">
                    <div
                      className={`timeline-container${selectedProject?.id === project.id ? ' timeline-container-active' : ''}${isProjectFullyCompleted ? ' timeline-container-completed' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedProject(project)
                        setSelectedStage(null)
                        setShowSidebar(true)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedProject(project)
                          setSelectedStage(null)
                          setShowSidebar(true)
                        }
                      }}
                    >
                      <div className="timeline-project-name">
                        <span>{project.name}</span>
                      </div>
                      <div className="timeline-wrapper">
                        <Timeline
                          stages={projectStages}
                          tasks={projectTasks}
                          project={project}
                          selectedStageId={selectedProject?.id === project.id ? selectedStage?.id ?? null : null}
                          onStageClick={(stage) => {
                            setSelectedProject(project)
                            setSelectedStage(stage)
                            setShowSidebar(true)
                          }}
                          onTitleClick={() => {
                            setSelectedProject(project)
                            setShowSidebar(true)
                          }}
                          sequential={false}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {selectedProject && (
          <ProjectSidebar
            key="project-sidebar"
            project={selectedProject}
            className={showSidebar ? '' : 'project-sidebar-hidden'}
            stages={stagesMap[selectedProject.id] || []}
            selectedStage={selectedStage}
            stageTasks={
              selectedStage && selectedProject
                ? (displayTasks[selectedProject.id] || []).filter(
                    (task) =>
                      task.stageId === selectedStage.id ||
                      (task.group_id != null &&
                        selectedStage.kaitenGroupId != null &&
                        String(task.group_id) === String(selectedStage.kaitenGroupId))
                  )
                : []
            }
            onBackToProject={() => setSelectedStage(null)}
            onClose={() => {
              setShowSidebar(false)
              setSelectedStage(null)
            }}
            onUpdate={async (updatedProject) => {
              try {
                await updateProject(selectedProject.id, { name: updatedProject.name })
                setSelectedProject(updatedProject)
                await refetch()
              } catch (error) {
                alert(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onDelete={() => {
              handleDelete(selectedProject)
            }}
            onRestore={handleRestore}
            onComplete={() => {}}
            onPause={() => {}}
            onSync={async () => {}}
            syncLoading={false}
          />
        )}
      </div>
      <DeleteToast ref={deleteToastRef} />
    </div>
  )
}
