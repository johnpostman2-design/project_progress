import React, { useState, useEffect, useRef } from 'react'
import { timestampToDate, formatDateDisplay } from '../../utils/dateUtils'
import './StageDateButton.css'

interface StageDateButtonProps {
  value?: any // Timestamp
  onChange: (date: Date | null) => void
  min?: Date
  max?: Date
  className?: string
}

export const StageDateButton: React.FC<StageDateButtonProps> = ({
  value,
  onChange,
  min,
  max,
  className = '',
}) => {
  const [dateValue, setDateValue] = useState<Date | null>(
    value ? timestampToDate(value) : null
  )

  useEffect(() => {
    if (value) {
      setDateValue(timestampToDate(value))
    } else {
      setDateValue(null)
    }
  }, [value])

  const displayValue = value ? formatDateDisplay(value) : '00.00.00'

  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Создаем скрытый input для вызова календаря
    const input = document.createElement('input')
    input.type = 'date'
    input.value = dateValue ? dateValue.toISOString().split('T')[0] : ''
    if (min) input.min = min.toISOString().split('T')[0]
    if (max) input.max = max.toISOString().split('T')[0]
    input.style.position = 'absolute'
    input.style.opacity = '0'
    input.style.pointerEvents = 'none'
    input.style.width = '0'
    input.style.height = '0'
    document.body.appendChild(input)
    
    // Используем showPicker если доступно
    if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
      try {
        (input as any).showPicker()
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.value) {
            onChange(new Date(target.value))
          }
          document.body.removeChild(input)
        })
        input.addEventListener('cancel', () => {
          document.body.removeChild(input)
        })
      } catch (err) {
        input.focus()
        input.click()
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (target.value) {
            onChange(new Date(target.value))
          }
          document.body.removeChild(input)
        })
        input.addEventListener('blur', () => {
          setTimeout(() => {
            if (document.body.contains(input)) {
              document.body.removeChild(input)
            }
          }, 100)
        })
      }
    } else {
      input.focus()
      input.click()
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        if (target.value) {
          onChange(new Date(target.value))
        }
        document.body.removeChild(input)
      })
      input.addEventListener('blur', () => {
        setTimeout(() => {
          if (document.body.contains(input)) {
            document.body.removeChild(input)
          }
        }, 100)
      })
    }
  }

  return (
    <button
      className={`stage-date-button ${className}`}
      onClick={handleButtonClick}
    >
      {displayValue}
    </button>
  )
}

