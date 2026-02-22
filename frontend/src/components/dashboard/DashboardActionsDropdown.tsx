import React, { useRef, useEffect } from 'react'
import { Icon16Cloud } from '../common/icons/Icon16Cloud'
import { Icon16Trash } from '../common/icons/Icon16Trash'
import { Button } from '../common/Button'
import './DashboardActionsDropdown.css'

interface DashboardActionsDropdownProps {
  onTestProject: () => void
  onDeleteAll: () => void
  onClose?: () => void
  testProjectLoading?: boolean
  deleteAllLoading?: boolean
  className?: string
}

export const DashboardActionsDropdown: React.FC<DashboardActionsDropdownProps> = ({
  onTestProject,
  onDeleteAll,
  onClose,
  testProjectLoading = false,
  deleteAllLoading = false,
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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={menuRef} className={`dashboard-actions-dropdown ${className}`}>
      <div className="dashboard-actions-dropdown-primary">
        <Button
          type="text"
          size="small"
          state={testProjectLoading ? 'loading' : undefined}
          disabled={testProjectLoading}
          onClick={onTestProject}
          className="dashboard-actions-dropdown-item"
        >
          <Icon16Cloud className="dashboard-actions-dropdown-icon" />
          <span className="dashboard-actions-dropdown-text">Тест проект</span>
        </Button>
      </div>
      <div className="dashboard-actions-dropdown-divider" />
      <div className="dashboard-actions-dropdown-danger">
        <Button
          type="text"
          size="small"
          state={deleteAllLoading ? 'loading' : undefined}
          disabled={deleteAllLoading}
          onClick={onDeleteAll}
          className="dashboard-actions-dropdown-item dashboard-actions-dropdown-item-danger"
        >
          <Icon16Trash className="dashboard-actions-dropdown-icon" />
          <span className="dashboard-actions-dropdown-text">Удалить все</span>
        </Button>
      </div>
    </div>
  )
}
