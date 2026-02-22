import React, { useRef, useEffect } from 'react'
import { Icon16Check } from '../common/icons/Icon16Check'
// import { Icon16Pause } from '../common/icons/Icon16Pause' // временно: пауза отключена
import { Icon16Pencil } from '../common/icons/Icon16Pencil'
import { Icon16Reload } from '../common/icons/Icon16Reload'
import { Icon16Trash } from '../common/icons/Icon16Trash'
import { Button } from '../common/Button'
import './ProjectDropdownMenu.css'

interface ProjectDropdownMenuProps {
  onComplete: () => void
  onPause: () => void
  onRename: () => void
  onSync: () => void
  onDelete: () => void
  onRestore?: () => void
  onClose?: () => void
  syncLoading?: boolean
  /** Вариант для архива: только «Вернуть в работу» и «Удалить» */
  archive?: boolean
  className?: string
}

export const ProjectDropdownMenu: React.FC<ProjectDropdownMenuProps> = ({
  onComplete,
  onPause: _onPause,
  onRename,
  onSync,
  onDelete,
  onRestore,
  onClose,
  syncLoading = false,
  archive = false,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

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

  if (archive) {
    return (
      <div ref={menuRef} className={`project-dropdown-menu ${className}`}>
        <div className="project-dropdown-menu-primary">
          <Button type="text" size="small" onClick={onRestore} className="project-dropdown-menu-item">
            <Icon16Reload className="project-dropdown-menu-icon" />
            <span className="project-dropdown-menu-text">Вернуть в работу</span>
          </Button>
        </div>
        <div className="project-dropdown-menu-divider" />
        <div className="project-dropdown-menu-danger">
          <Button type="text" size="small" onClick={onDelete} className="project-dropdown-menu-item project-dropdown-menu-item-danger">
            <Icon16Trash className="project-dropdown-menu-icon" />
            <span className="project-dropdown-menu-text">Удалить</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={menuRef} className={`project-dropdown-menu ${className}`}>
      <div className="project-dropdown-menu-primary">
        <Button type="text" size="small" onClick={onComplete} className="project-dropdown-menu-item">
          <Icon16Check className="project-dropdown-menu-icon" />
          <span className="project-dropdown-menu-text">Завершить</span>
        </Button>
        <Button type="text" size="small" onClick={onRename} className="project-dropdown-menu-item">
          <Icon16Pencil className="project-dropdown-menu-icon" />
          <span className="project-dropdown-menu-text">Переименовать</span>
        </Button>
        <Button type="text" size="small" state={syncLoading ? 'loading' : undefined} onClick={onSync} className="project-dropdown-menu-item" disabled={syncLoading}>
          <Icon16Reload className="project-dropdown-menu-icon" />
          <span className="project-dropdown-menu-text">Обновить из Kaiten</span>
        </Button>
      </div>
      <div className="project-dropdown-menu-divider" />
      <div className="project-dropdown-menu-danger">
        <Button type="text" size="small" onClick={onDelete} className="project-dropdown-menu-item project-dropdown-menu-item-danger">
          <Icon16Trash className="project-dropdown-menu-icon" />
          <span className="project-dropdown-menu-text">Удалить</span>
        </Button>
      </div>
    </div>
  )
}
