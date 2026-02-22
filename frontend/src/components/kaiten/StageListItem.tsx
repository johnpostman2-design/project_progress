import React, { useState } from 'react'
import { KaitenGroup } from '../../services/kaiten/kaitenTypes'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Icon16Minus } from '../common/icons/Icon16Minus'
import { Icon16ArrowRight } from '../common/icons/Icon16ArrowRight'
import './StageListItem.css'

interface StageListItemProps {
  stage: KaitenGroup
  stageNumber: number
  startDate: Date | null
  endDate: Date | null
  onNameChange: (stageId: number, newName: string) => void
  onStartDateChange: (stageId: number, date: Date | null) => void
  onEndDateChange: (stageId: number, date: Date | null) => void
  onDelete: (stageId: number) => void
  className?: string
}

export const StageListItem: React.FC<StageListItemProps> = ({
  stage,
  stageNumber,
  startDate,
  endDate,
  onNameChange,
  onStartDateChange,
  onEndDateChange,
  onDelete,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [hoveredArea, setHoveredArea] = useState<'name' | 'dates' | null>(null)
  const [editedName, setEditedName] = useState(stage.name)
  
  // Показываем кнопку удаления если наведено на область названия
  // Показываем даты если наведено на область дат или ничего не наведено
  const showDeleteButton = hoveredArea === 'name'
  const showDates = hoveredArea !== 'name'

  // Обновляем editedName при изменении stage.name
  React.useEffect(() => {
    setEditedName(stage.name)
  }, [stage.name])

  // Логирование для отладки
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[StageListItem] Stage data:', {
        id: stage.id,
        name: stage.name,
        hasName: !!stage.name,
        nameLength: stage.name?.length || 0,
      })
    }
  }, [stage])

  const handleNameClick = () => {
    setIsEditing(true)
  }

  const handleNameBlur = () => {
    setIsEditing(false)
    if (editedName.trim() && editedName !== stage.name) {
      onNameChange(stage.id, editedName.trim())
    } else {
      setEditedName(stage.name)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setEditedName(stage.name)
      setIsEditing(false)
    }
  }

  // Форматирование даты в формат DD.MM.YY
  const formatDate = (date: Date | null): string => {
    if (!date) return 'дата'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}.${month}.${year}`
  }

  const startDateInputRef = React.useRef<HTMLInputElement>(null)
  const endDateInputRef = React.useRef<HTMLInputElement>(null)

  const handleStartDateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (startDateInputRef.current) {
      // Используем showPicker если доступно (современные браузеры)
      if ('showPicker' in startDateInputRef.current && typeof (startDateInputRef.current as any).showPicker === 'function') {
        try {
          (startDateInputRef.current as any).showPicker()
        } catch (err) {
          // Если showPicker не поддерживается, используем клик
          startDateInputRef.current.focus()
          startDateInputRef.current.click()
        }
      } else {
        // Для старых браузеров
        startDateInputRef.current.focus()
        startDateInputRef.current.click()
      }
    }
  }

  const handleEndDateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (endDateInputRef.current) {
      // Используем showPicker если доступно (современные браузеры)
      if ('showPicker' in endDateInputRef.current && typeof (endDateInputRef.current as any).showPicker === 'function') {
        try {
          (endDateInputRef.current as any).showPicker()
        } catch (err) {
          // Если showPicker не поддерживается, используем клик
          endDateInputRef.current.focus()
          endDateInputRef.current.click()
        }
      } else {
        // Для старых браузеров
        endDateInputRef.current.focus()
        endDateInputRef.current.click()
      }
    }
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onStartDateChange(stage.id, new Date(e.target.value))
    } else {
      onStartDateChange(stage.id, null)
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onEndDateChange(stage.id, new Date(e.target.value))
    } else {
      onEndDateChange(stage.id, null)
    }
  }


  return (
    <div
      className={`stage-list-item ${className}`}
      data-node-id="247:1508"
    >
      {isEditing ? (
        <Input
          type="primary"
          size="small"
          placeholder="Название этапа"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          autoFocus
          className="stage-list-item-name-input"
          data-node-id="247:1497"
        />
      ) : (
        <div
          className="stage-list-item-name-container"
          onMouseEnter={() => setHoveredArea('name')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <div
            className={`stage-list-item-name ${hoveredArea === 'name' ? 'hover' : ''}`}
            onClick={handleNameClick}
            data-node-id="247:1722"
            title={stage.name || 'Без названия'} /* Tooltip для полного названия */
          >
            <span className="stage-list-item-number">{stageNumber}.</span>
            <span>{stage.name || `Этап ${stage.id}`}</span>
          </div>
          {hoveredArea === 'name' && (
            <Button
              type="backless"
              size="small"
              onClick={() => onDelete(stage.id)}
              className="stage-list-item-delete-button button-icon-only"
              data-node-id="247:2221"
            >
              <Icon16Minus />
            </Button>
          )}
        </div>
      )}
      {!isEditing && (
        <div 
          className="stage-list-item-actions" 
          data-node-id="247:1735"
        >
          {showDates && (
            <div
              onMouseEnter={() => setHoveredArea('dates')}
              onMouseLeave={() => setHoveredArea(null)}
              style={{ display: 'flex', gap: 'var(--spacing-4, 4px)', alignItems: 'center' }}
            >
              <input
                ref={startDateInputRef}
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleStartDateChange}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                tabIndex={-1}
              />
              <button
                className="stage-list-item-date-button"
                onClick={handleStartDateClick}
                type="button"
                data-node-id="228:116"
              >
                {formatDate(startDate)}
              </button>
              <div className="stage-list-item-arrow" data-node-id="247:2207">
                <Icon16ArrowRight className="stage-list-item-arrow-icon" />
              </div>
              <input
                ref={endDateInputRef}
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={handleEndDateChange}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                tabIndex={-1}
              />
              <button
                className="stage-list-item-date-button"
                onClick={handleEndDateClick}
                type="button"
                data-node-id="228:116"
              >
                {formatDate(endDate)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
