import React, { useRef, useEffect } from 'react'
import { Stage } from '../../models/stage'
import { Icon } from '../ui/Icon'
import { Button } from '../common/Button'
import './StageDropdownMenu.css'

interface StageDropdownMenuProps {
  stage: Stage
  onRename: () => void
  onPause: () => void
  onComplete: () => void
  onReactivate?: () => void
  onDelete: () => void
  onClose?: () => void
  className?: string
}

export const StageDropdownMenu: React.FC<StageDropdownMenuProps> = ({
  stage,
  onRename,
  onPause: _onPause, // временно не используется: пауза отключена
  onComplete,
  onReactivate,
  onDelete,
  onClose,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const isCompleted = stage.status === 'completed'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div ref={menuRef} className={`stage-dropdown-menu ${className}`}>
      <div className="stage-dropdown-menu-primary">
        {isCompleted && onReactivate && (
          <Button type="text" size="small" onClick={onReactivate} className="stage-dropdown-menu-item">
            <Icon name="reload" size={16} className="stage-dropdown-menu-icon" />
            <span className="stage-dropdown-menu-text">Вернуть в работу</span>
          </Button>
        )}
        {!isCompleted && (
          <Button type="text" size="small" onClick={onComplete} className="stage-dropdown-menu-item">
            <Icon name="check" size={16} className="stage-dropdown-menu-icon" />
            <span className="stage-dropdown-menu-text">Завершить</span>
          </Button>
        )}
        <Button type="text" size="small" onClick={onRename} className="stage-dropdown-menu-item">
          <Icon name="pencil" size={16} className="stage-dropdown-menu-icon" />
          <span className="stage-dropdown-menu-text">Переименовать</span>
        </Button>
        {/* Временно отключено: постановка этапа на паузу
        {!isCompleted && (
          <Button type="text" size="small" onClick={onPause} className="stage-dropdown-menu-item">
            <Icon name="pause" size={16} className="stage-dropdown-menu-icon" />
            <span className="stage-dropdown-menu-text">Пауза</span>
          </Button>
        )} */}
      </div>
      <div className="stage-dropdown-menu-divider" />
      <div className="stage-dropdown-menu-danger">
        <Button type="text" size="small" onClick={onDelete} className="stage-dropdown-menu-item stage-dropdown-menu-item-danger">
          <Icon name="trash" size={16} className="stage-dropdown-menu-icon" />
          <span className="stage-dropdown-menu-text">Удалить</span>
        </Button>
      </div>
    </div>
  )
}
