import React from 'react'
import { Icon24Loading } from './icons/Icon24Loading'
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
      <Icon24Loading />
    </div>
  )
}
