import React from 'react'
import { Icon } from '../ui/Icon'
import './Button.css'

interface ButtonProps {
  type?: 'primary' | 'secondary' | 'text' | 'backless' | 'success' | 'danger' | 'caution'
  size?: 'small' | 'medium' | 'large'
  state?: 'default' | 'hover' | 'disabled' | 'loading'
  buttonType?: 'button' | 'submit' | 'reset'
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'small',
  state,
  buttonType = 'button',
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  // loading имеет приоритет над disabled; при loading кнопка неактивна
  const isLoading = state === 'loading'
  const actualState = isLoading ? 'loading' : (disabled ? 'disabled' : (state || 'default'))
  const buttonTypeClass = type === 'primary' ? 'primary' : type

  return (
    <button
      type={buttonType}
      className={`button button-${buttonTypeClass} button-${size} button-${actualState} ${className}`}
      onClick={onClick}
      disabled={disabled || actualState === 'disabled' || isLoading}
      data-name="button"
    >
      {isLoading ? (
        <>
          <span className="button-loading-placeholder" aria-hidden>
            {children}
          </span>
          <Icon name="loading" size={16} className="button-loading-icon icon-spin" />
        </>
      ) : (
        children
      )}
    </button>
  )
}
