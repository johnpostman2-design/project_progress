import React from 'react'
import './Input.css'

interface InputProps {
  type?: 'backless' | 'primary'
  size?: 'small' | 'medium'
  state?: 'default' | 'hover' | 'focus' | 'disabled' | 'invalid'
  inputType?: 'text' | 'password' | 'email' | 'number' | 'date' | 'tel' | 'url' | 'search'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (e?: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e?: React.FocusEvent<HTMLInputElement>) => void
  onClick?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: string
  autoFocus?: boolean
  className?: string
  'data-node-id'?: string
}

export const Input: React.FC<InputProps> = ({
  type = 'backless',
  size = 'small',
  state,
  inputType = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  disabled = false,
  error,
  autoFocus = false,
  className = '',
  'data-node-id': dataNodeId,
}) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  // Для date input проверяем наличие значения по-другому (date всегда в формате YYYY-MM-DD)
  const hasValue = inputType === 'date' 
    ? value && value.length > 0 
    : value && value.trim().length > 0

  const actualState = disabled
    ? 'disabled'
    : error
      ? 'invalid'
      : isFocused
        ? hasValue
          ? 'filled'
          : 'focus'
        : hasValue
          ? isHovered
            ? 'filled-hover'
            : 'filled'
          : isHovered
            ? 'hover'
            : state || 'default'

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  return (
    <div
      className={`input-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type={inputType}
        className={`input input-${type} input-${size} input-${actualState}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        data-name="input"
        data-node-id={dataNodeId}
      />
      {error && actualState === 'invalid' && (
        <p className="input-error">{error}</p>
      )}
    </div>
  )
}
