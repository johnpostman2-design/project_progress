import React, { useState } from 'react'
import './DatePicker.css'

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  min?: Date
  max?: Date
  className?: string
  disabled?: boolean
  type?: 'backless' | 'primary'
  size?: 'small' | 'medium'
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  className = '',
  disabled = false,
  type = 'backless',
  size = 'small',
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const dateValue = value ? value.toISOString().split('T')[0] : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value
    if (dateString) {
      onChange(new Date(dateString))
    } else {
      onChange(null)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
  }

  // Определяем состояние для стилизации (аналогично Input компоненту)
  const actualState = disabled
    ? 'disabled'
    : isFocused
      ? dateValue
        ? 'filled'
        : 'focus'
      : dateValue
        ? isHovered
          ? 'filled-hover'
          : 'filled'
        : isHovered
          ? 'hover'
          : 'default'

  return (
    <div className={`date-picker ${className}`}>
      {label && (
        <label className="date-picker-label">
          {label}
        </label>
      )}
      <div
        className="date-picker-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="date"
          className={`date-picker-input date-picker-input-${type} date-picker-input-${size} date-picker-input-${actualState}`}
          value={dateValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min?.toISOString().split('T')[0]}
          max={max?.toISOString().split('T')[0]}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
