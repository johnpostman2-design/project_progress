import React, { useState } from 'react'
import { Stage, pauseStage, resumeStage } from '../../models/stage'
import { Task, sortTasksForDisplay } from '../../models/task'
import { calculateStageProgress, getCompletedTasksCount, getTotalTasksCount } from '../../utils/progressCalculator'
import { updateStage, deleteStage } from '../../services/supabase/supabaseService'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { DatePicker } from '../common/DatePicker'
import { StagePauseModal } from './StagePauseModal'
import { formatDate, dateToTimestamp, timestampToDate, validateDates } from '../../utils/dateUtils'

interface StageDetailsProps {
  stage: Stage
  tasks: Task[]
  projectId: string
  onUpdate: (stage: Stage) => void
  onDelete: () => void
  onClose?: () => void
  className?: string
}

export const StageDetails: React.FC<StageDetailsProps> = ({
  stage,
  tasks,
  projectId,
  onUpdate,
  onDelete,
  onClose,
  className = '',
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(stage.name)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingDates, setIsEditingDates] = useState(false)
  const [startDate, setStartDate] = useState<Date>(timestampToDate(stage.startDate))
  const [endDate, setEndDate] = useState<Date>(timestampToDate(stage.endDate))
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showEditPauseReasonModal, setShowEditPauseReasonModal] = useState(false)

  const progress = calculateStageProgress(stage, tasks)
  const completedCount = getCompletedTasksCount(tasks, stage.id)
  const totalCount = getTotalTasksCount(tasks, stage.id)

  const handleRename = async () => {
    if (editedName.trim() === '') {
      alert('Название не может быть пустым')
      return
    }

    try {
      await updateStage(projectId, stage.id, { name: editedName.trim() })
      onUpdate({ ...stage, name: editedName.trim() })
      setIsEditingName(false)
    } catch (error) {
      alert(`Ошибка переименования: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteStage(projectId, stage.id)
      onDelete()
    } catch (error) {
      alert(`Ошибка удаления: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSaveDates = async () => {
    if (!validateDates(startDate, endDate)) {
      alert('Дата окончания должна быть >= даты начала')
      return
    }

    try {
      await updateStage(projectId, stage.id, {
        startDate: dateToTimestamp(startDate),
        endDate: dateToTimestamp(endDate),
      })
      onUpdate({
        ...stage,
        startDate: dateToTimestamp(startDate),
        endDate: dateToTimestamp(endDate),
      })
      setIsEditingDates(false)
    } catch (error) {
      alert(`Ошибка обновления дат: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handlePause = async (reason: string) => {
    try {
      const paused = pauseStage(stage, reason)
      await updateStage(projectId, stage.id, {
        status: paused.status,
        pauseReason: paused.pauseReason,
      })
      onUpdate(paused)
      setShowPauseModal(false)
    } catch (error) {
      alert(`Ошибка постановки на паузу: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleResume = async () => {
    try {
      const resumed = resumeStage(stage)
      await updateStage(projectId, stage.id, {
        status: resumed.status,
        pauseReason: resumed.pauseReason,
      })
      onUpdate(resumed)
    } catch (error) {
      alert(`Ошибка возобновления: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditPauseReason = async (reason: string) => {
    try {
      await updateStage(projectId, stage.id, {
        pauseReason: reason,
      })
      onUpdate({ ...stage, pauseReason: reason })
      setShowEditPauseReasonModal(false)
    } catch (error) {
      alert(`Ошибка обновления причины: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className={`stage-details ${className}`}>
      <div className="stage-details-header">
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
                  setEditedName(stage.name)
                  setIsEditingName(false)
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <h2 onClick={() => setIsEditingName(true)} style={{ cursor: 'pointer' }}>
            {stage.name}
          </h2>
        )}
        {onClose && (
          <button onClick={onClose} className="stage-details-close">
            ×
          </button>
        )}
      </div>
      <div className="stage-details-content">
        <div className="stage-details-info">
          <div>Статус: {stage.status}</div>
          {stage.pauseReason && <div>Причина паузы: {stage.pauseReason}</div>}
          {isEditingDates ? (
            <div className="dates-edit">
              <DatePicker
                label="Дата начала"
                value={startDate}
                onChange={(date) => date && setStartDate(date)}
                max={endDate}
              />
              <DatePicker
                label="Дата окончания"
                value={endDate}
                onChange={(date) => date && setEndDate(date)}
                min={startDate}
              />
              <button onClick={handleSaveDates}>Сохранить</button>
              <button onClick={() => setIsEditingDates(false)}>Отмена</button>
            </div>
          ) : (
            <div className="dates-display">
              <div>Начало: {formatDate(stage.startDate)}</div>
              <div>Окончание: {formatDate(stage.endDate)}</div>
              <button onClick={() => setIsEditingDates(true)}>Изменить даты</button>
            </div>
          )}
        </div>
        <div className="stage-details-progress">
          <div>Прогресс: {progress.toFixed(0)}%</div>
          <div>
            Задачи: {completedCount} / {totalCount}
          </div>
        </div>
        <div className="stage-details-tasks">
          <h3>Задачи:</h3>
          {tasks.length === 0 ? (
            <div>Нет задач</div>
          ) : (
            <ul>
              {sortTasksForDisplay(tasks).map((task) => (
                <li key={task.id}>
                  {task.title} - {task.isCompleted ? 'Выполнено' : 'В работе'}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="stage-details-actions">
          {stage.status === 'active' && (
            <button onClick={() => setShowPauseModal(true)}>Поставить на паузу</button>
          )}
          {stage.status === 'paused' && (
            <>
              <button onClick={handleResume}>Возобновить</button>
              <button onClick={() => setShowEditPauseReasonModal(true)}>Изменить причину паузы</button>
            </>
          )}
          <button onClick={() => setShowDeleteConfirm(true)} className="delete-button">
            Удалить этап
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Удаление этапа"
          message={`Вы уверены, что хотите удалить этап "${stage.name}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showPauseModal && (
        <StagePauseModal
          stageName={stage.name}
          onSave={handlePause}
          onCancel={() => setShowPauseModal(false)}
        />
      )}

      {showEditPauseReasonModal && (
        <StagePauseModal
          stageName={stage.name}
          currentReason={stage.pauseReason}
          onSave={handleEditPauseReason}
          onCancel={() => setShowEditPauseReasonModal(false)}
        />
      )}
    </div>
  )
}
