import React, { useState } from 'react'
import { Project } from '../../models/project'
import { updateProject, deleteProject } from '../../services/supabase/supabaseService'
import { completeProject, archiveProject } from '../../models/project'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { DatePicker } from '../common/DatePicker'
import { formatDate, dateToTimestamp, timestampToDate, validateDates } from '../../utils/dateUtils'

interface ProjectDetailsProps {
  project: Project
  onUpdate: (project: Project) => void
  onDelete: () => void
  onClose?: () => void
  className?: string
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onUpdate,
  onDelete,
  onClose,
  className = '',
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(project.name)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [isEditingDates, setIsEditingDates] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(
    project.startDate ? timestampToDate(project.startDate) : null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    project.endDate ? timestampToDate(project.endDate) : null
  )

  const handleRename = async () => {
    if (editedName.trim() === '') {
      alert('Название не может быть пустым')
      return
    }

    try {
      await updateProject(project.id, { name: editedName.trim() })
      onUpdate({ ...project, name: editedName.trim() })
      setIsEditingName(false)
    } catch (error) {
      alert(`Ошибка переименования: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProject(project.id)
      onDelete()
    } catch (error) {
      alert(`Ошибка удаления: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleComplete = async () => {
    try {
      const completed = completeProject(project)
      await updateProject(project.id, { status: completed.status })
      onUpdate(completed)
      setShowCompleteConfirm(false)
    } catch (error) {
      alert(`Ошибка завершения: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleArchive = async () => {
    try {
      const archived = archiveProject(project)
      await updateProject(project.id, { status: archived.status })
      onUpdate(archived)
    } catch (error) {
      alert(`Ошибка архивации: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSaveDates = async () => {
    if (!validateDates(startDate, endDate)) {
      alert('Дата окончания должна быть >= даты начала')
      return
    }

    try {
      await updateProject(project.id, {
        startDate: startDate ? dateToTimestamp(startDate) : undefined,
        endDate: endDate ? dateToTimestamp(endDate) : undefined,
      })
      onUpdate({
        ...project,
        startDate: startDate ? dateToTimestamp(startDate) : project.startDate,
        endDate: endDate ? dateToTimestamp(endDate) : project.endDate,
      })
      setIsEditingDates(false)
    } catch (error) {
      alert(`Ошибка обновления дат: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className={`project-details ${className}`}>
      <div className="project-details-header">
        {isEditingName ? (
          <div className="name-edit">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename()
                } else if (e.key === 'Escape') {
                  setEditedName(project.name)
                  setIsEditingName(false)
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <h2 onClick={() => setIsEditingName(true)} style={{ cursor: 'pointer' }}>
            {project.name}
          </h2>
        )}
        {onClose && (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        )}
      </div>

      <div className="project-details-content">
        <div className="project-info">
          <div>Статус: {project.status}</div>
          {isEditingDates ? (
            <div className="dates-edit">
              <DatePicker
                label="Дата начала"
                value={startDate}
                onChange={setStartDate}
                max={endDate || undefined}
              />
              <DatePicker
                label="Дата окончания"
                value={endDate}
                onChange={setEndDate}
                min={startDate || undefined}
              />
              <button onClick={handleSaveDates}>Сохранить</button>
              <button onClick={() => setIsEditingDates(false)}>Отмена</button>
            </div>
          ) : (
            <div className="dates-display">
              <div>Начало: {formatDate(project.startDate)}</div>
              <div>Окончание: {formatDate(project.endDate)}</div>
              <button onClick={() => setIsEditingDates(true)}>Изменить даты</button>
            </div>
          )}
        </div>

        <div className="project-actions">
          <button onClick={() => setShowCompleteConfirm(true)}>Завершить проект</button>
          <button onClick={handleArchive}>Отправить в архив</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="delete-button">
            Удалить проект
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Удаление проекта"
          message={`Вы уверены, что хотите удалить проект "${project.name}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showCompleteConfirm && (
        <ConfirmDialog
          title="Завершение проекта"
          message={`Вы уверены, что хотите завершить проект "${project.name}"?`}
          confirmText="Завершить"
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteConfirm(false)}
        />
      )}
    </div>
  )
}
