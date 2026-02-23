import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useArchivedCount } from '../hooks/useArchivedCount'
import { useKaitenSync } from '../hooks/useKaitenSync'
import { useKaitenWebhook } from '../hooks/useKaitenWebhook'
import { Project } from '../models/project'
import { Stage } from '../models/stage'
import { Task } from '../models/task'
import { ProjectList } from '../components/projects/ProjectList'
import { ProjectSidebar } from '../components/projects/ProjectSidebar'
import { Timeline } from '../components/timeline/Timeline'
import { KaitenImportModal } from '../components/kaiten/KaitenImportModal'
import { StagePauseModal } from '../components/stages/StagePauseModal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Button } from '../components/common/Button'
import { Icon } from '../components/ui/Icon'
import { DashboardActionsDropdown } from '../components/dashboard/DashboardActionsDropdown'
import { ProgressBar } from '../components/timeline/ProgressBar'
import { createProject, createStage, updateProject, getProject, deleteAllProjects, deleteProject, updateStage, deleteStage, getStages } from '../services/supabase/supabaseService'
import { KaitenConfig, KaitenGroup } from '../services/kaiten/kaitenTypes'
import { archiveProject } from '../models/project'
import { pauseStage, canPauseStage, completeStage, reactivateStage } from '../models/stage'
import { dateToTimestamp, timestampToDate } from '../utils/dateUtils'
import { createTestProject } from '../utils/createTestProject'
import { DeleteToast, type DeleteToastRef } from '../components/common/DeleteToast'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import './Dashboard.css'

export const Dashboard: React.FC = () => {
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects()
  const { count: archivedCount, refetch: refetchArchivedCount } = useArchivedCount()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [tasks, setTasks] = useState<Record<string, Task[]>>({}) // projectId -> tasks
  const [stagesMap, setStagesMap] = useState<Record<string, Stage[]>>({}) // projectId -> stages
  const [showImportModal, setShowImportModal] = useState(false)
  const [showRebindModal, setShowRebindModal] = useState(false)
  const [kaitenConfig, setKaitenConfigState] = useState<KaitenConfig | null>(null)

  // Восстановление конфига Kaiten из localStorage (только domain, boardId, spaceId; токен не храним)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kaitenConfig')
      if (stored) {
        const parsed = JSON.parse(stored) as KaitenConfig
        if (parsed?.domain) {
          const safe = { domain: parsed.domain, boardId: parsed.boardId, spaceId: parsed.spaceId }
          if (parsed.baseUrl && !parsed.baseUrl.startsWith('/')) delete (safe as Record<string, unknown>).baseUrl
          setKaitenConfigState(safe as KaitenConfig)
        }
      }
    } catch (_e) {
      // ignore invalid stored config
    }
  }, [])

  const setKaitenConfig = (config: KaitenConfig | null) => {
    setKaitenConfigState(config)
    if (config) {
      try {
        const toStore = { domain: config.domain, boardId: config.boardId, spaceId: config.spaceId }
        localStorage.setItem('kaitenConfig', JSON.stringify(toStore))
      } catch (_e) {
        // ignore quota etc
      }
    } else {
      try {
        localStorage.removeItem('kaitenConfig')
      } catch (_e) {}
    }
  }

  const { syncProject, loading: syncLoading } = useKaitenSync(kaitenConfig)

  // Kaiten External Webhooks: при изменении задач на доске в Kaiten — синхронизируем проект
  useKaitenWebhook((boardId) => {
    const project = projects.find((p) => p.kaitenBoardId != null && String(p.kaitenBoardId) === String(boardId))
    if (project && kaitenConfig) {
      syncProject(project).then((projectTasks) => {
        setTasks((prev) => ({ ...prev, [project.id]: projectTasks }))
      }).catch((err) => console.error('[Dashboard] Webhook sync failed:', err))
    }
  })

  const [isRenamingProject, setIsRenamingProject] = useState(false)
  const [editedProjectName, setEditedProjectName] = useState('')
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)
  const [testProjectLoading, setTestProjectLoading] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [pendingDeleteProjectIds, setPendingDeleteProjectIds] = useState<Set<string>>(new Set())
  const [pendingDeleteAll, setPendingDeleteAll] = useState(false)
  const deleteToastRef = React.useRef<DeleteToastRef>(null)
  const [renameSaveLoading, setRenameSaveLoading] = useState(false)
  // Защита от повторных вызовов getCardsByBoard: один раз на boardId при первом появлении
  const loadedBoardIdsRef = useRef<Set<string>>(new Set())

  // Auto-sync on focus/return to app (только проекты с привязанной доской Kaiten)
  useEffect(() => {
    if (!kaitenConfig || projects.length === 0) return

    const handleFocus = async () => {
      const withBoard = projects.filter((p) => p.kaitenBoardId != null && String(p.kaitenBoardId).trim() !== '')
      for (const project of withBoard) {
        try {
          const projectTasks = await syncProject(project)
          setTasks((prev) => ({ ...prev, [project.id]: projectTasks }))
        } catch (error) {
          console.error(`Auto-sync failed for project ${project.id}:`, error)
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [projects, kaitenConfig, syncProject])

  const handleManualSync = async () => {
    if (!kaitenConfig || projects.length === 0) {
      alert('Настройте Kaiten config')
      return
    }

    const withBoard = projects.filter((p) => p.kaitenBoardId != null && String(p.kaitenBoardId).trim() !== '')
    if (withBoard.length === 0) {
      alert('Нет проектов с привязанной доской Kaiten')
      return
    }

    try {
      const newTasksMap: Record<string, Task[]> = { ...tasks }
      for (const project of withBoard) {
        try {
          const projectTasks = await syncProject(project)
          newTasksMap[project.id] = projectTasks
        } catch (error) {
          console.error(`Sync failed for project ${project.id}:`, error)
        }
      }
      setTasks(newTasksMap)
      alert('Синхронизация завершена')
    } catch (error) {
      alert(`Ошибка синхронизации: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Load stages for all projects
  useEffect(() => {
    const loadAllStages = async () => {
      const newStagesMap: Record<string, Stage[]> = {}
      for (const project of projects) {
        try {
          const projectStages = await getStages(project.id)
          newStagesMap[project.id] = projectStages
        } catch (error) {
          console.error(`Failed to load stages for project ${project.id}:`, error)
          newStagesMap[project.id] = []
        }
      }
      setStagesMap(newStagesMap)
    }
    if (projects.length > 0) {
      loadAllStages()
    }
  }, [projects])

  // Авто-синхронизация задач из Kaiten при загрузке страницы и при появлении проектов/конфига
  useEffect(() => {
    if (!kaitenConfig || projects.length === 0) return

    const projectsWithBoard = projects.filter((p) => p.kaitenBoardId != null && String(p.kaitenBoardId).trim() !== '')
    if (projectsWithBoard.length === 0) return

    projectsWithBoard.forEach((project) => {
      const boardIdKey = String(project.kaitenBoardId)
      if (loadedBoardIdsRef.current.has(boardIdKey)) return
      loadedBoardIdsRef.current.add(boardIdKey)

      syncProject(project)
        .then((projectTasks) => {
          setTasks((prev) => ({ ...prev, [project.id]: projectTasks }))
        })
        .catch((error) => {
          console.error(`Failed to sync tasks for project ${project.id}:`, error)
          loadedBoardIdsRef.current.delete(boardIdKey)
          setTasks((prev) => ({ ...prev, [project.id]: prev[project.id] ?? [] }))
        })
    })

    return () => {
      projectsWithBoard.forEach((p) => {
        if (p.kaitenBoardId != null) loadedBoardIdsRef.current.delete(String(p.kaitenBoardId))
      })
    }
  }, [projects, kaitenConfig, syncProject])

  // Задачи из Kaiten без подмены — прогресс считается по isCompleted из API
  const displayTasks = tasks

  const [isCreatingProject, setIsCreatingProject] = useState(false)

  const handleCreateProject = async (
    projectName: string,
    boardId: number,
    groups: KaitenGroup[],
    dates: Record<number, { start: Date | null; end: Date | null }>
  ) => {
    // Защита от двойного вызова
    if (isCreatingProject) {
      console.log('[Dashboard] Project creation already in progress, ignoring duplicate call')
      return
    }

    console.log('[Dashboard] handleCreateProject called', {
      projectName,
      boardId,
      groupsCount: groups.length,
      datesCount: Object.keys(dates).length,
      hasKaitenConfig: !!kaitenConfig,
    })

    if (!kaitenConfig) {
      alert('Kaiten config is not set')
      return
    }

    setIsCreatingProject(true)

    try {
      console.log('[Dashboard] Creating project...')
      // Create project
      let project: Project
      try {
        project = await createProject({
          name: projectName,
          kaitenBoardId: String(boardId),
          status: 'active',
        })
        console.log('[Dashboard] Project created:', project.id, project)
      } catch (createError) {
        console.error('[Dashboard] Error in createProject:', createError)
        throw createError
      }

      // Create stages for all groups from Kaiten (только с указанными датами)
      console.log('[Dashboard] Creating stages...', { groupsCount: groups.length, projectId: project.id })
      const stageDates: Date[] = []
      
      for (const group of groups) {
        const groupDates = dates[group.id]
        // Пропускаем этапы без дат
        if (!groupDates?.start || !groupDates?.end) {
          console.log('[Dashboard] Skipping stage without dates:', { groupId: group.id, groupName: group.name })
          continue
        }
        
        console.log('[Dashboard] Creating stage:', { groupId: group.id, groupName: group.name, hasDates: !!groupDates, startDate: groupDates.start, endDate: groupDates.end })
        
        try {
          // Сохраняем даты для расчета дат проекта
          stageDates.push(groupDates.start, groupDates.end)

          const createdStage = await createStage(project.id, {
            name: group.name, // Используем название группы из Kaiten
            startDate: dateToTimestamp(groupDates.start),
            endDate: dateToTimestamp(groupDates.end),
            kaitenGroupId: String(group.id),
            status: 'active',
          })
          console.log('[Dashboard] Stage created:', createdStage.id)
        } catch (stageError) {
          console.error('[Dashboard] Error creating stage:', stageError, { groupId: group.id, groupName: group.name })
          throw stageError
        }
      }
      console.log('[Dashboard] All stages created, total:', stageDates.length / 2)
      
      // Вычисляем и обновляем даты проекта на основе дат этапов
      let updatedProject = project
      if (stageDates.length > 0) {
        const projectStartDate = new Date(Math.min(...stageDates.map(d => d.getTime())))
        const projectEndDate = new Date(Math.max(...stageDates.map(d => d.getTime())))
        
        console.log('[Dashboard] Updating project dates:', { projectStartDate, projectEndDate })
        
        // Обновляем проект с вычисленными датами
        await updateProject(project.id, {
          startDate: dateToTimestamp(projectStartDate),
          endDate: dateToTimestamp(projectEndDate),
        })
        
        // Получаем обновленный проект с датами
        const loaded = await getProject(project.id)
        if (loaded) updatedProject = loaded
        console.log('[Dashboard] Updated project loaded:', updatedProject.id)
      }

      // Sync tasks (один раз; ref помечает boardId как загруженный)
      if (updatedProject!.kaitenBoardId) {
        loadedBoardIdsRef.current.add(String(updatedProject!.kaitenBoardId))
      }
      console.log('[Dashboard] Syncing tasks...')
      const syncedTasks = await syncProject(updatedProject!)
      console.log('[Dashboard] Tasks synced:', syncedTasks.length)
      setTasks(prev => ({ ...prev, [updatedProject!.id]: syncedTasks }))

      // Устанавливаем обновленный проект как выбранный для открытия сайдблока
      setSelectedProject(updatedProject!)
      setShowSidebar(true)
      setShowImportModal(false)
      
      // Обновляем список проектов
      await refetchProjects()
      
      // Загружаем этапы для нового проекта
      const newStages = await getStages(updatedProject.id)
      setStagesMap(prev => ({ ...prev, [updatedProject.id]: newStages }))
      
      console.log('[Dashboard] Project creation completed')
    } catch (error) {
      console.error('[Dashboard] Error creating project:', error)
      alert(`Ошибка создания проекта: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingProject(false)
    }
  }

  if (projectsLoading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <div className={`dashboard-header ${selectedProject && showSidebar ? 'dashboard-header-sidebar-open' : ''}`}>
          <h1 className="dashboard-header-title">Прогресс проектов</h1>
          <div className="dashboard-header-actions">
            <RouterLink
              to="/archive"
              className="dashboard-header-link"
            >
              <span>Архив</span>
              {archivedCount > 0 ? (
                <span className="dashboard-header-link-counter">{archivedCount}</span>
              ) : (
                <span className="dashboard-header-link-secondary">0</span>
              )}
            </RouterLink>
            <div className="dashboard-header-actions-buttons">
              <div className="dashboard-header-actions-kebab-wrap">
                <Button
                  type="secondary"
                  size="small"
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="button-icon-only"
                >
                  <Icon name="kebab" size={16} />
                </Button>
                {showActionsDropdown && (
                  <DashboardActionsDropdown
                    onTestProject={async () => {
                      setShowActionsDropdown(false)
                      if (!kaitenConfig) {
                        alert('Сначала подключите Kaiten')
                        return
                      }
                      if (confirm('Создать тестовый проект с доской 1618291?')) {
                        setTestProjectLoading(true)
                        try {
                          const projectId = await createTestProject({
                            boardId: 1618291,
                            kaitenConfig,
                          })
                          await refetchProjects()
                          const newProject = await getProject(projectId)
                          if (!newProject) throw new Error('Проект не найден')
                          setSelectedProject(newProject)
                          setShowSidebar(true)
                          const newStages = await getStages(projectId)
                          setStagesMap(prev => ({ ...prev, [projectId]: newStages }))
                          if (newProject.kaitenBoardId) {
                            loadedBoardIdsRef.current.add(String(newProject.kaitenBoardId))
                          }
                          const projectTasks = await syncProject(newProject)
                          setTasks(prev => ({ ...prev, [projectId]: projectTasks }))
                          await refetchProjects()
                          alert('Тестовый проект создан!')
                        } catch (error) {
                          alert(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`)
                        } finally {
                          setTestProjectLoading(false)
                        }
                      }
                    }}
                    onDeleteAll={() => {
                      setShowActionsDropdown(false)
                      setShowDeleteAllConfirm(true)
                    }}
                    onClose={() => setShowActionsDropdown(false)}
                    testProjectLoading={testProjectLoading}
                    deleteAllLoading={deleteAllLoading}
                  />
                )}
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => setShowImportModal(true)}
              >
                <Icon name="plus" size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className={`dashboard-content ${selectedProject && showSidebar ? 'dashboard-content-sidebar-open' : ''}`}>
          {projectsError ? (
            <div className="dashboard-empty-state dashboard-error-state">
              <p><strong>Ошибка загрузки проектов:</strong> {projectsError.message}</p>
              <p className="dashboard-error-hint">Проверьте Supabase: Dashboard → Table Editor → таблица <code>projects</code>. Убедитесь, что в проекте выполнен <code>supabase-schema.sql</code>.</p>
              <Button onClick={() => refetchProjects()} type="secondary">Повторить</Button>
            </div>
          ) : projects.length === 0 || pendingDeleteAll ? (
            <div className="dashboard-empty-state">
              <p>Нет проектов. Создайте первый проект, нажав кнопку +</p>
            </div>
          ) : (
            <div className="dashboard-projects-timelines">
              {projects.filter((p) => !pendingDeleteProjectIds.has(p.id)).map((project) => {
                const projectStages = stagesMap[project.id] || []
                const projectTasks = displayTasks[project.id] || []
                const isProjectFullyCompleted =
                  projectStages.length > 0 && projectStages.every((s) => s.status === 'completed')
                return (
                  <div key={project.id} className="dashboard-project-timeline-wrapper">
                    <div
                      className={`timeline-container${selectedProject?.id === project.id ? ' timeline-container-active' : ''}${isProjectFullyCompleted ? ' timeline-container-completed' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setShowImportModal(false)
                        setSelectedProject(project)
                        setSelectedStage(null)
                        setShowSidebar(true)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setShowImportModal(false)
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
                            setShowImportModal(false)
                            setSelectedProject(project)
                            setSelectedStage(stage)
                            setShowSidebar(true)
                          }}
                          onTitleClick={() => {
                            setShowImportModal(false)
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
            stageTasks={selectedStage && selectedProject
              ? (displayTasks[selectedProject.id] || []).filter(
                  (task) => task.stageId === selectedStage.id || (task.group_id != null && selectedStage.kaitenGroupId != null && String(task.group_id) === String(selectedStage.kaitenGroupId))
                )
              : []}
            onBackToProject={() => setSelectedStage(null)}
            onClose={() => {
              setShowSidebar(false)
              setSelectedStage(null)
            }}
            onUpdate={async (updatedProject) => {
              try {
                await updateProject(selectedProject.id, { name: updatedProject.name })
                setSelectedProject(updatedProject)
                await refetchProjects()
              } catch (error) {
                alert(`Ошибка обновления проекта: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onDelete={() => {
              if (!selectedProject) return
              const project = selectedProject
              setPendingDeleteProjectIds((prev) => new Set(prev).add(project.id))
              setSelectedProject(null)
              setSelectedStage(null)
              setShowSidebar(false)
              deleteToastRef.current?.show(
                project.name,
                () => {
                  setPendingDeleteProjectIds((prev) => {
                    const next = new Set(prev)
                    next.delete(project.id)
                    return next
                  })
                  refetchProjects()
                  refetchArchivedCount()
                },
                async () => {
                  try {
                    await deleteProject(project.id)
                    setPendingDeleteProjectIds((prev) => {
                      const next = new Set(prev)
                      next.delete(project.id)
                      return next
                    })
                    await refetchProjects()
                    await refetchArchivedCount()
                  } catch (error) {
                    setPendingDeleteProjectIds((prev) => {
                      const next = new Set(prev)
                      next.delete(project.id)
                      return next
                    })
                    alert(`Ошибка удаления: ${error instanceof Error ? error.message : 'Unknown error'}`)
                  }
                }
              )
            }}
            onComplete={async () => {
              if (!selectedProject) return
              try {
                const archived = archiveProject(selectedProject)
                await updateProject(selectedProject.id, { status: archived.status })
                setSelectedProject(null)
                setSelectedStage(null)
                setShowSidebar(false)
                await refetchProjects()
                await refetchArchivedCount()
              } catch (error) {
                alert(`Ошибка завершения: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onPause={() => {
              setShowPauseModal(true)
            }}
            onRename={() => {
              setEditedProjectName(selectedProject?.name ?? '')
              setIsRenamingProject(true)
            }}
            onSync={handleManualSync}
            syncLoading={syncLoading}
            onStageClick={setSelectedStage}
            onStageUpdate={async (updatedStage) => {
              try {
                await updateStage(selectedProject.id, updatedStage.id, {
                  name: updatedStage.name,
                  startDate: updatedStage.startDate,
                  endDate: updatedStage.endDate,
                  status: updatedStage.status,
                })
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                if (selectedStage?.id === updatedStage.id) {
                  setSelectedStage(updatedStage)
                }
              } catch (error) {
                alert(`Ошибка обновления этапа: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onStageDelete={async (stageId) => {
              try {
                await deleteStage(selectedProject.id, stageId)
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                if (selectedStage?.id === stageId) {
                  setSelectedStage(null)
                }
              } catch (error) {
                alert(`Ошибка удаления этапа: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onStagePause={async (stage, reason) => {
              if (!reason) {
                setShowPauseModal(true)
                return
              }
              try {
                const paused = pauseStage(stage, reason)
                await updateStage(selectedProject.id, stage.id, {
                  status: paused.status,
                  pauseReason: paused.pauseReason,
                })
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
              } catch (error) {
                alert(`Ошибка паузы этапа: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onStageComplete={async (stage) => {
              try {
                const completed = completeStage(stage)
                await updateStage(selectedProject.id, stage.id, {
                  status: completed.status,
                })
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                if (selectedStage?.id === stage.id) {
                  setSelectedStage(completed)
                }
              } catch (error) {
                alert(`Ошибка завершения этапа: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onStageReactivate={async (stage) => {
              try {
                const reactivated = reactivateStage(stage)
                await updateStage(selectedProject.id, stage.id, {
                  status: reactivated.status,
                  pauseReason: reactivated.pauseReason,
                })
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                if (selectedStage?.id === stage.id) {
                  setSelectedStage(reactivated)
                }
              } catch (error) {
                alert(`Ошибка возврата этапа в работу: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onStageRename={async (stage, newName) => {
              try {
                await updateStage(selectedProject.id, stage.id, {
                  name: newName,
                })
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
              } catch (error) {
                alert(`Ошибка переименования этапа: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onStageDateChange={async (stage, startDate, endDate) => {
              try {
                const stageId = typeof stage?.id === 'string' ? stage.id : String(stage?.id ?? '')
                if (!stageId) return
                await updateStage(selectedProject.id, stageId, {
                  startDate: startDate ? dateToTimestamp(startDate) : undefined,
                  endDate: endDate ? dateToTimestamp(endDate) : undefined,
                })
                // Обновляем этапы в локальном состоянии
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                const updatedStage = updatedStages.find((s) => s.id === stageId)
                if (updatedStage && selectedStage?.id === stageId) {
                  setSelectedStage(updatedStage)
                }
                // Обновляем даты проекта на основе этапов
                if (updatedStages && updatedStages.length > 0) {
                  const allStartDates = updatedStages.map(s => s.startDate?.toMillis()).filter(Boolean) as number[]
                  const allEndDates = updatedStages.map(s => s.endDate?.toMillis()).filter(Boolean) as number[]
                  if (allStartDates.length > 0 && allEndDates.length > 0) {
                    const projectStartDate = new Date(Math.min(...allStartDates))
                    const projectEndDate = new Date(Math.max(...allEndDates))
                    await updateProject(selectedProject.id, {
                      startDate: dateToTimestamp(projectStartDate),
                      endDate: dateToTimestamp(projectEndDate),
                    })
                    const updatedProject = await getProject(selectedProject.id)
                    if (updatedProject) {
                      setSelectedProject(updatedProject)
                      await refetchProjects()
                    }
                  }
                }
              } catch (error) {
                alert(`Ошибка изменения дат этапа: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
          />
        )}
        {isRenamingProject && (
          <div className="project-rename-overlay" onClick={() => setIsRenamingProject(false)}>
            <div className="project-rename-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Переименовать проект</h3>
              <input
                type="text"
                value={editedProjectName}
                onChange={(e) => setEditedProjectName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    if (editedProjectName.trim() === '') {
                      alert('Название не может быть пустым')
                      return
                    }
                    try {
                      await updateProject(selectedProject!.id, { name: editedProjectName.trim() })
                      setSelectedProject({ ...selectedProject!, name: editedProjectName.trim() })
                      setIsRenamingProject(false)
                      await refetchProjects()
                    } catch (error) {
                      alert(`Ошибка переименования: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    }
                  } else if (e.key === 'Escape') {
                    setIsRenamingProject(false)
                  }
                }}
                autoFocus
              />
              <div className="project-rename-actions">
                <Button type="backless" size="small" onClick={() => setIsRenamingProject(false)} disabled={renameSaveLoading}>
                  Отмена
                </Button>
                <Button
                  type="primary"
                  size="small"
                  state={renameSaveLoading ? 'loading' : undefined}
                  disabled={renameSaveLoading}
                  onClick={async () => {
                    if (editedProjectName.trim() === '') {
                      alert('Название не может быть пустым')
                      return
                    }
                    setRenameSaveLoading(true)
                    try {
                      await updateProject(selectedProject!.id, { name: editedProjectName.trim() })
                      setSelectedProject({ ...selectedProject!, name: editedProjectName.trim() })
                      setIsRenamingProject(false)
                      await refetchProjects()
                    } catch (error) {
                      alert(`Ошибка переименования: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    } finally {
                      setRenameSaveLoading(false)
                    }
                  }}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        )}
        {showPauseModal && selectedProject && (
          <StagePauseModal
            stageName={`проект "${selectedProject.name}"`}
            onSave={async (reason: string) => {
              try {
                // Ставим все активные этапы на паузу
                const activeStages = (stagesMap[selectedProject.id] || []).filter((s) => canPauseStage(s))
                for (const stage of activeStages) {
                  const paused = pauseStage(stage, reason)
                  await updateStage(selectedProject.id, stage.id, {
                    status: paused.status,
                    pauseReason: paused.pauseReason,
                  })
                }
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                setShowPauseModal(false)
                alert('Все этапы проекта поставлены на паузу')
              } catch (error) {
                alert(`Ошибка постановки на паузу: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            onCancel={() => setShowPauseModal(false)}
          />
        )}
      </div>
      {showImportModal && (
        <div className="sidebar">
          <KaitenImportModal
            config={kaitenConfig}
            onConfigChange={(newConfig) => {
              setKaitenConfig(newConfig)
            }}
            onImport={handleCreateProject}
            onClose={() => {
              setShowImportModal(false)
            }}
          />
        </div>
      )}
      {showRebindModal && selectedProject && (
        <div className="sidebar">
          <KaitenImportModal
            config={kaitenConfig}
            onConfigChange={(newConfig) => {
              setKaitenConfig(newConfig)
            }}
            onImport={async (projectName, boardId, groups, dates) => {
              // Режим перепривязки: удаляем старые этапы и создаем новые
              try {
                // Удаляем все старые этапы
                const currentStages = stagesMap[selectedProject.id] || []
                for (const stage of currentStages) {
                  await deleteStage(selectedProject.id, stage.id)
                }
                // Создаем новые этапы на основе групп из Kaiten
                const stageDates: Date[] = []
                for (const group of groups) {
                  const startDate = dates[group.id]?.start || new Date()
                  const endDate = dates[group.id]?.end || new Date()
                  stageDates.push(startDate, endDate)
                  
                  await createStage(selectedProject.id, {
                    name: group.name,
                    startDate: dateToTimestamp(startDate),
                    endDate: dateToTimestamp(endDate),
                    kaitenGroupId: String(group.id),
                    status: 'active',
                  })
                }
                // Обновляем даты проекта на основе новых дат этапов
                if (stageDates.length > 0) {
                  const projectStartDate = new Date(Math.min(...stageDates.map(d => d.getTime())))
                  const projectEndDate = new Date(Math.max(...stageDates.map(d => d.getTime())))
                  await updateProject(selectedProject.id, {
                    startDate: dateToTimestamp(projectStartDate),
                    endDate: dateToTimestamp(projectEndDate),
                  })
                }
                const updatedStages = await getStages(selectedProject.id)
                setStagesMap(prev => ({ ...prev, [selectedProject.id]: updatedStages }))
                const updatedProject = await getProject(selectedProject.id)
                setSelectedProject(updatedProject)
                await refetchProjects()
                setShowRebindModal(false)
                alert('Этапы перепривязаны')
              } catch (error) {
                alert(`Ошибка перепривязки: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            existingProjectId={selectedProject.id}
            onClose={() => {
              setShowRebindModal(false)
            }}
          />
        </div>
      )}
      {showDeleteAllConfirm && (
        <ConfirmDialog
          title="Точно удалить все проекты?"
          confirmText="Удалить"
          cancelText="Отмена"
          confirmVariant="danger"
          onConfirm={() => {
            setShowDeleteAllConfirm(false)
            setSelectedProject(null)
            setPendingDeleteAll(true)
            deleteToastRef.current?.showWithUndo(
              'Все проекты удалены',
              () => {
                setPendingDeleteAll(false)
                refetchProjects()
                refetchArchivedCount()
              },
              async () => {
                try {
                  await deleteAllProjects()
                  setPendingDeleteAll(false)
                  await refetchProjects()
                  await refetchArchivedCount()
                } catch (error) {
                  setPendingDeleteAll(false)
                  alert(`Ошибка удаления: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }
            )
          }}
          onCancel={() => setShowDeleteAllConfirm(false)}
        />
      )}
      <DeleteToast ref={deleteToastRef} />
    </div>
  )
}
