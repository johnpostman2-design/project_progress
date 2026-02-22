import React, { memo } from 'react'
import './Icon16Pencil.css'

interface Icon16PencilProps {
  className?: string
}

const Icon16PencilComponent: React.FC<Icon16PencilProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-pencil ${className}`} data-name="icon/pencil">
      <div className="icon-16-pencil-size">
        <svg className="icon-16-pencil-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M11 2L14 5l-9 9H2v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export const Icon16Pencil = memo(Icon16PencilComponent)
