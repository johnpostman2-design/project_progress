import React from 'react'
import { Icon } from '../ui/Icon'
import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  return (
    <div className={`loading-spinner loading-spinner-${size} ${className}`} role="status" aria-label="Загрузка">
      <Icon name="loading" size={24} className="icon-spin" />
    </div>
  )
}
