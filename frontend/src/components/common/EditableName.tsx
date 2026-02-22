import React, { useState, useRef, useEffect } from 'react'
import './EditableName.css'

interface EditableNameProps {
  value: string
  onSave: (newValue: string) => void
  placeholder?: string
  className?: string
  size?: 'medium' | 'small'
  /** Увеличить значение, чтобы перевести название в режим редактирования извне (например, из дропдауна «Переименовать») */
  triggerEdit?: number
}

export const EditableName: React.FC<EditableNameProps> = ({
  value,
  onSave,
  placeholder = 'Placeholder',
  className = '',
  size = 'medium',
  triggerEdit = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [editedValue, setEditedValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditedValue(value)
  }, [value])

  useEffect(() => {
    if (triggerEdit > 0) {
      setIsEditing(true)
    }
  }, [triggerEdit])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Сбрасываем ховер при клике вне элемента
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isEditing && isHovered) {
        const target = e.target as HTMLElement
        const element = document.querySelector(`.editable-name`)
        if (element && !element.contains(target)) {
          setIsHovered(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, isHovered])

  const handleClick = () => {
    setIsHovered(false)
    setIsEditing(true)
  }

  const handleBlur = () => {
    if (editedValue.trim() === '') {
      setEditedValue(value)
      setIsEditing(false)
      return
    }
    if (editedValue.trim() !== value) {
      onSave(editedValue.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (editedValue.trim() === '') {
        setEditedValue(value)
        setIsEditing(false)
        return
      }
      if (editedValue.trim() !== value) {
        onSave(editedValue.trim())
      }
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      setEditedValue(value)
      setIsEditing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedValue(e.target.value)
  }

  if (isEditing) {
    return (
      <div className={`editable-name editable-name-focus editable-name-${size} ${className}`}>
        <div className="editable-name-input-container">
          <input
            ref={inputRef}
            type="text"
            value={editedValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="editable-name-input"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`editable-name editable-name-${isHovered ? 'hover' : 'default'} editable-name-${size} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isHovered ? (
        <div className="editable-name-hover-container">
          <p className="editable-name-text">{value}</p>
        </div>
      ) : (
        <p className="editable-name-text">{value}</p>
      )}
    </div>
  )
}
