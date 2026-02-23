import React, { useState, useRef, useEffect } from 'react'
import { Project } from '../../models/project'
import { Stage } from '../../models/stage'
import { Task, sortTasksForDisplay } from '../../models/task'
import { formatDateDisplay, timestampToDate } from '../../utils/dateUtils'
import { Icon } from '../ui/Icon'
import { ProjectDropdownMenu } from './ProjectDropdownMenu'
import { StageDropdownMenu } from '../stages/StageDropdownMenu'
import { EditableName } from '../common/EditableName'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { Link } from '../common/Link'
import './ProjectSidebar.css'

interface ProjectSidebarProps {
  project: Project
  stages: Stage[]
  selectedStage?: Stage | null
  stageTasks?: Task[]
  onBackToProject?: () => void
  onUpdate: (project: Project) => void
  onDelete: () => void
  onComplete: () => void
  onRestore?: () => void
  onPause: () => void
  onRename?: () => void
  onSync: () => void
  syncLoading?: boolean
  onStageClick?: (stage: Stage) => void
  onStageUpdate?: (stage: Stage) => void
  onStageDelete?: (stageId: string) => void
  onStagePause?: (stage: Stage, reason: string) => void
  onStageComplete?: (stage: Stage) => void
  onStageReactivate?: (stage: Stage) => void
  onStageRename?: (stage: Stage, newName: string) => void
  onStageDateChange?: (stage: Stage, startDate: Date | null, endDate: Date | null) => void
  onClose?: () => void
  className?: string
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = (props) => {
  const {
    project,
    stages,
    selectedStage: selectedStageProp = null,
    stageTasks = [],
    onBackToProject,
    onUpdate,
    onDelete,
    onComplete,
    onRestore,
    onPause,
    onSync,
    syncLoading = false,
    onStageClick,
    onStageUpdate,
    onStageDelete,
    onStagePause,
    onStageComplete,
    onStageReactivate,
    onStageRename,
    onStageDateChange,
    onClose,
    className = '',
  } = props

  const [showDropdown, setShowDropdown] = useState(false)
  const [showStageDetailsKebab, setShowStageDetailsKebab] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [stageDropdownId, setStageDropdownId] = useState<string | null>(null)
  const [hoveredStageArea, setHoveredStageArea] = useState<Record<string, 'name' | 'dates' | null>>({})
  const [editedStageNames, setEditedStageNames] = useState<Record<string, string>>({})
  const [showStageDeleteConfirm, setShowStageDeleteConfirm] = useState<string | null>(null)
  const [triggerProjectNameEdit, setTriggerProjectNameEdit] = useState(0)
  const [triggerStageNameEdit, setTriggerStageNameEdit] = useState(0)
  const [editingStageDetailsDate, setEditingStageDetailsDate] = useState<'start' | 'end' | null>(null)
  const [editingDate, setEditingDate] = useState<{ stageId: string; field: 'start' | 'end' } | null>(null)
  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleDelete = () => {
    setShowDropdown(false)
    setShowDeleteConfirm(true)
  }

  const handleComplete = () => {
    setShowDropdown(false)
    setShowCompleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onDelete()
  }

  const handleConfirmComplete = () => {
    setShowCompleteConfirm(false)
    onComplete()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.confirm-dialog-overlay') || target.closest('.confirm-dialog')) {
        return
      }
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        /* Клик по таймлайну/проекту не закрывает сайдбар — позволяет переключаться между проектами без закрытия */
        if (target.closest('.timeline-wrapper') || target.closest('.timeline') || target.closest('.timeline-container') || target.closest('.dashboard-projects-timelines') || target.closest('.archive-projects-timelines')) {
          return
        }
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  /* Сброс триггера переименования этапа при переходе на вид этапа/смене этапа — фокус только по «Переименовать» */
  useEffect(() => {
    setTriggerStageNameEdit(0)
  }, [selectedStageProp?.id])

  const handleProjectNameSave = async (newName: string) => {
    if (newName.trim() === '') {
      alert('Название не может быть пустым')
      return
    }
    try {
      onUpdate({ ...project, name: newName.trim() })
    } catch (error) {
      alert(`Ошибка переименования: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleStageNameBlur = (stage: Stage) => {
    const editedName = editedStageNames[stage.id] || stage.name
    if (editedName.trim() && editedName !== stage.name) {
      handleStageNameSave(stage, editedName.trim())
    } else {
      setEditingStageId(null)
      const newEditedNames = { ...editedStageNames }
      delete newEditedNames[stage.id]
      setEditedStageNames(newEditedNames)
    }
  }

  const handleStageNameSave = async (stage: Stage, newName: string) => {
    if (newName.trim() === '') {
      alert('Название не может быть пустым')
      return
    }
    try {
      const updatedStage = { ...stage, name: newName.trim() }
      onStageUpdate?.(updatedStage)
      onStageRename?.(stage, newName.trim())
      setEditingStageId(null)
      const newEditedNames = { ...editedStageNames }
      delete newEditedNames[stage.id]
      setEditedStageNames(newEditedNames)
    } catch (error) {
      alert(`Ошибка переименования: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Форматирование даты в формат DD.MM.YY
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'дата'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}.${month}.${year}`
  }

  const startDateInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const endDateInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (editingStageDetailsDate === 'start' && startDateInputRef.current) {
      startDateInputRef.current.focus()
      if ('showPicker' in startDateInputRef.current && typeof (startDateInputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
        try {
          (startDateInputRef.current as HTMLInputElement & { showPicker: () => void }).showPicker()
        } catch {
          // ignore
        }
      }
    }
  }, [editingStageDetailsDate])

  useEffect(() => {
    if (editingStageDetailsDate === 'end' && endDateInputRef.current) {
      endDateInputRef.current.focus()
      if ('showPicker' in endDateInputRef.current && typeof (endDateInputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
        try {
          (endDateInputRef.current as HTMLInputElement & { showPicker: () => void }).showPicker()
        } catch {
          // ignore
        }
      }
    }
  }, [editingStageDetailsDate])

  useEffect(() => {
    if (editingDate && endDateInputRefs.current[editingDate.stageId] && editingDate.field === 'end') {
      const inputRef = endDateInputRefs.current[editingDate.stageId]
      if (inputRef) {
        inputRef.focus()
        if ('showPicker' in inputRef && typeof (inputRef as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
          try {
            (inputRef as HTMLInputElement & { showPicker: () => void }).showPicker()
          } catch {
            // ignore
          }
        }
      }
    }
  }, [editingDate])

  useEffect(() => {
    if (editingDate && startDateInputRefs.current[editingDate.stageId] && editingDate.field === 'start') {
      const inputRef = startDateInputRefs.current[editingDate.stageId]
      if (inputRef) {
        inputRef.focus()
        if ('showPicker' in inputRef && typeof (inputRef as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
          try {
            (inputRef as HTMLInputElement & { showPicker: () => void }).showPicker()
          } catch {
            // ignore
          }
        }
      }
    }
  }, [editingDate])

  const handleStartDateClick = (stage: Stage, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingDate({ stageId: stage.id, field: 'start' })
  }

  const handleEndDateClick = (stage: Stage, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingDate({ stageId: stage.id, field: 'end' })
  }

  const handleStartDateChange = (stage: Stage, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onStageDateChange?.(stage, new Date(e.target.value), timestampToDate(stage.endDate))
    } else {
      onStageDateChange?.(stage, null, timestampToDate(stage.endDate))
    }
  }

  const handleEndDateChange = (stage: Stage, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onStageDateChange?.(stage, timestampToDate(stage.startDate), new Date(e.target.value))
    } else {
      onStageDateChange?.(stage, timestampToDate(stage.startDate), null)
    }
  }

  const handleStageDetailsNameSave = async (newName: string) => {
    if (!selectedStageProp || newName.trim() === '') return
    try {
      const updated = { ...selectedStageProp, name: newName.trim() }
      onStageUpdate?.(updated)
      onStageRename?.(selectedStageProp, newName.trim())
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : 'Unknown'}`)
    }
  }

  const handleStageDetailsStartDateClick = () => setEditingStageDetailsDate('start')
  const handleStageDetailsEndDateClick = () => setEditingStageDetailsDate('end')

  const completedCount = stageTasks.filter((t) => t.isCompleted).length
  const totalCount = stageTasks.length

  return (
    <div ref={sidebarRef} className={`project-sidebar ${className}`}>
      <div className={`project-sidebar-container${selectedStageProp ? ' project-sidebar-stage-view' : ''}`}>
        {selectedStageProp ? (
          <>
            <Link asButton onClick={onBackToProject} className="project-sidebar-back-link">
              {project.name}
            </Link>
            <div className="project-sidebar-header project-sidebar-stage-header">
              <div className="project-sidebar-name-container">
                <div className="project-sidebar-name-editable-wrapper">
                  <EditableName
                    value={selectedStageProp.name}
                    onSave={handleStageDetailsNameSave}
                    size="medium"
                    className="project-sidebar-name-editable"
                    triggerEdit={triggerStageNameEdit}
                  />
                </div>
                <div className="project-sidebar-kebab-container">
                  <div className="project-sidebar-kebab-button-wrap" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}>
                    <Button type="text" size="medium" className="project-sidebar-kebab-button" onClick={() => setShowStageDetailsKebab(!showStageDetailsKebab)}>
                      <Icon name="kebab" size={24} />
                    </Button>
                  </div>
                  {showStageDetailsKebab && (
                    <StageDropdownMenu
                      stage={selectedStageProp}
                      onRename={() => { setShowStageDetailsKebab(false); setTriggerStageNameEdit((n) => n + 1) }}
                      onPause={() => { setShowStageDetailsKebab(false); onStagePause?.(selectedStageProp, '') }}
                      onComplete={() => { setShowStageDetailsKebab(false); onStageComplete?.(selectedStageProp) }}
                      onReactivate={() => { setShowStageDetailsKebab(false); onStageReactivate?.(selectedStageProp) }}
                      onDelete={() => { setShowStageDetailsKebab(false); setShowStageDeleteConfirm(selectedStageProp.id) }}
                      onClose={() => setShowStageDetailsKebab(false)}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="project-sidebar-dates project-sidebar-stage-dates">
              {editingStageDetailsDate === 'start' ? (
                <input
                  ref={startDateInputRef}
                  type="date"
                  className="project-sidebar-date-input-visible"
                  value={selectedStageProp.startDate ? timestampToDate(selectedStageProp.startDate).toISOString().split('T')[0] : ''}
                  min={undefined}
                  onChange={(e) => handleStartDateChange(selectedStageProp, e)}
                  onBlur={() => setEditingStageDetailsDate(null)}
                />
              ) : (
                <button type="button" className="project-sidebar-btn-date" onClick={handleStageDetailsStartDateClick}>
                  {formatDateDisplay(selectedStageProp.startDate)}
                </button>
              )}
              <div className="project-sidebar-date-arrow">→</div>
              {editingStageDetailsDate === 'end' ? (
                <input
                  ref={endDateInputRef}
                  type="date"
                  className="project-sidebar-date-input-visible"
                  value={selectedStageProp.endDate ? timestampToDate(selectedStageProp.endDate).toISOString().split('T')[0] : ''}
                  min={selectedStageProp.startDate ? timestampToDate(selectedStageProp.startDate).toISOString().split('T')[0] : undefined}
                  onChange={(e) => handleEndDateChange(selectedStageProp, e)}
                  onBlur={() => setEditingStageDetailsDate(null)}
                />
              ) : (
                <button type="button" className="project-sidebar-btn-date" onClick={handleStageDetailsEndDateClick}>
                  {formatDateDisplay(selectedStageProp.endDate)}
                </button>
              )}
            </div>
            <div className="project-sidebar-stage-tasks-section">
              <p className="project-sidebar-stage-tasks-counter">{completedCount} / {totalCount} задач</p>
              <ul className="project-sidebar-stage-tasks-list">
                {stageTasks.length === 0 ? (
                  <li className="project-sidebar-stage-task-empty">Нет задач</li>
                ) : (
                  sortTasksForDisplay(stageTasks).map((task) => (
                    <li key={task.id} className={`project-sidebar-stage-task-item${task.isCompleted ? ' completed' : ''}`}>
                      <span className="project-sidebar-stage-task-icon"><Icon name="check" size={16} /></span>
                      <span className="project-sidebar-stage-task-title">{task.title}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        ) : (
          <>
        <div className="project-sidebar-header">
          <div className="project-sidebar-name-container">
            <div className="project-sidebar-name-editable-wrapper">
              <EditableName
                value={project.name}
                onSave={handleProjectNameSave}
                size="medium"
                className="project-sidebar-name-editable"
                triggerEdit={triggerProjectNameEdit}
              />
            </div>
            <div className="project-sidebar-kebab-container">
              <div
                className="project-sidebar-kebab-button-wrap"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Button
                  type="text"
                  size="medium"
                  className="project-sidebar-kebab-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Icon name="kebab" size={24} />
                </Button>
              </div>
              {showDropdown && (
                <ProjectDropdownMenu
                  archive={!!onRestore}
                  onComplete={handleComplete}
                  onRestore={() => {
                    setShowDropdown(false)
                    onRestore?.()
                  }}
                  onPause={() => {
                    setShowDropdown(false)
                    onPause()
                  }}
                  onRename={() => {
                    setShowDropdown(false)
                    setTriggerProjectNameEdit((n) => n + 1)
                  }}
                  onSync={() => {
                    setShowDropdown(false)
                    onSync()
                  }}
                  onDelete={handleDelete}
                  onClose={() => setShowDropdown(false)}
                  syncLoading={syncLoading}
                />
              )}
            </div>
          </div>
          <div className="project-sidebar-dates">
            <p className="project-sidebar-date">{formatDateDisplay(project.startDate)}</p>
            <div className="project-sidebar-date-arrow">→</div>
            <p className="project-sidebar-date">{formatDateDisplay(project.endDate)}</p>
          </div>
        </div>
        <div className="project-sidebar-stages">
          <div className="project-sidebar-stages-header">
            <p className="project-sidebar-stages-title">Этапы</p>
          </div>
          <div className="project-sidebar-stages-list">
            {stages.map((stage) => {
              const hoveredArea = hoveredStageArea[stage.id] || null
              const showKebab = hoveredArea === 'name'
              const showDates = hoveredArea !== 'name'
              const editedName = editedStageNames[stage.id] !== undefined ? editedStageNames[stage.id] : stage.name

              return (
                <div
                  key={stage.id}
                  className="project-sidebar-stage-item"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.project-sidebar-stage-actions')) {
                      return
                    }
                    if ((e.target as HTMLElement).closest('.project-sidebar-stage-kebab-container')) {
                      return
                    }
                    onStageClick?.(stage)
                  }}
                >
                  {editingStageId === stage.id ? (
                    <div className="project-sidebar-stage-name-input-wrapper">
                      <Input
                        type="primary"
                        size="small"
                        placeholder="Название этапа"
                        value={editedName}
                        onChange={(e) => {
                          setEditedStageNames({ ...editedStageNames, [stage.id]: e.target.value })
                        }}
                        onBlur={() => handleStageNameBlur(stage)}
                        autoFocus
                        className="project-sidebar-stage-name-input"
                      />
                    </div>
                  ) : (
                    <div
                      className="project-sidebar-stage-name-container"
                      onMouseEnter={() => {
                        setHoveredStageArea(prev => ({ ...prev, [stage.id]: 'name' }))
                      }}
                      onMouseLeave={() => {
                        setHoveredStageArea(prev => {
                          const newState = { ...prev }
                          delete newState[stage.id]
                          return newState
                        })
                      }}
                    >
                      <div
                        className={`project-sidebar-stage-name ${hoveredArea === 'name' ? 'hover' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onStageClick?.(stage)
                        }}
                      >
                        <span>{stage.name}</span>
                      </div>
                      {showKebab && (
                        <div 
                          className="project-sidebar-stage-kebab-container"
                          onMouseEnter={(e) => {
                            e.stopPropagation()
                            setHoveredStageArea(prev => ({ ...prev, [stage.id]: 'name' }))
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation()
                            // Не сбрасываем ховер, если открыт dropdown
                            if (stageDropdownId !== stage.id) {
                              setHoveredStageArea(prev => {
                                const newState = { ...prev }
                                delete newState[stage.id]
                                return newState
                              })
                            }
                          }}
                        >
                          <div
                            className="project-sidebar-stage-kebab-button-wrap"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <Button
                              type="text"
                              size="small"
                              className="project-sidebar-stage-kebab-button"
                              onClick={() => setStageDropdownId(stageDropdownId === stage.id ? null : stage.id)}
                            >
                              <Icon name="kebab" size={16} />
                            </Button>
                          </div>
                          {stageDropdownId === stage.id && (
                            <StageDropdownMenu
                              stage={stage}
                              onRename={() => {
                                setStageDropdownId(null)
                                setEditingStageId(stage.id)
                                setEditedStageNames(prev => ({ ...prev, [stage.id]: stage.name }))
                              }}
                              onPause={() => {
                                setStageDropdownId(null)
                                onStagePause?.(stage, '')
                              }}
                              onComplete={() => {
                                setStageDropdownId(null)
                                onStageComplete?.(stage)
                              }}
                              onReactivate={() => {
                                setStageDropdownId(null)
                                onStageReactivate?.(stage)
                              }}
                              onDelete={() => {
                                setStageDropdownId(null)
                                setShowStageDeleteConfirm(stage.id)
                              }}
                              onClose={() => {
                                setStageDropdownId(null)
                                setHoveredStageArea(prev => {
                                  const newState = { ...prev }
                                  delete newState[stage.id]
                                  return newState
                                })
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {!editingStageId && (
                    <div 
                      className="project-sidebar-stage-actions" 
                    >
                      {showDates && (
                        <div
                          className="project-sidebar-stage-dates-inner"
                          onMouseEnter={() => {
                            setHoveredStageArea(prev => ({ ...prev, [stage.id]: 'dates' }))
                          }}
                          onMouseLeave={() => {
                            setHoveredStageArea(prev => {
                              const newState = { ...prev }
                              delete newState[stage.id]
                              return newState
                            })
                          }}
                        >
                          {editingDate?.stageId === stage.id && editingDate?.field === 'start' ? (
                            <input
                              ref={(el) => { startDateInputRefs.current[stage.id] = el }}
                              type="date"
                              className="project-sidebar-stage-date-input"
                              value={stage.startDate ? timestampToDate(stage.startDate).toISOString().split('T')[0] : ''}
                              min={undefined}
                              onChange={(e) => handleStartDateChange(stage, e)}
                              onBlur={() => setEditingDate(null)}
                            />
                          ) : (
                            <button
                              className="project-sidebar-stage-date-button"
                              onClick={(e) => handleStartDateClick(stage, e)}
                              type="button"
                            >
                              {formatDate(stage.startDate)}
                            </button>
                          )}
                          <div className="project-sidebar-stage-arrow">
                            <Icon name="arrow-right" size={16} className="project-sidebar-stage-arrow-icon" />
                          </div>
                          {editingDate?.stageId === stage.id && editingDate?.field === 'end' ? (
                            <input
                              ref={(el) => { endDateInputRefs.current[stage.id] = el }}
                              type="date"
                              className="project-sidebar-stage-date-input"
                              value={stage.endDate ? timestampToDate(stage.endDate).toISOString().split('T')[0] : ''}
                              min={stage.startDate ? timestampToDate(stage.startDate).toISOString().split('T')[0] : undefined}
                              onChange={(e) => handleEndDateChange(stage, e)}
                              onBlur={() => setEditingDate(null)}
                            />
                          ) : (
                            <button
                              className="project-sidebar-stage-date-button"
                              onClick={(e) => handleEndDateClick(stage, e)}
                              type="button"
                            >
                              {formatDate(stage.endDate)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Точно удалить проект?"
          message=""
          confirmText="Удалить"
          cancelText="Отмена"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showCompleteConfirm && (
        <ConfirmDialog
          title="Завершение проекта"
          message={`Вы уверены, что хотите завершить проект "${project.name}"?`}
          confirmText="Завершить"
          onConfirm={handleConfirmComplete}
          onCancel={() => setShowCompleteConfirm(false)}
        />
      )}

      {showStageDeleteConfirm && (
        <ConfirmDialog
          title="Точно удалить этап?"
          message=""
          confirmText="Удалить"
          cancelText="Отмена"
          confirmVariant="danger"
          onConfirm={() => {
            onStageDelete?.(showStageDeleteConfirm)
            setShowStageDeleteConfirm(null)
            if (selectedStageProp?.id === showStageDeleteConfirm) onBackToProject?.()
          }}
          onCancel={() => setShowStageDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
