import React, { memo } from 'react'
import './Icon16Trash.css'

interface Icon16TrashProps {
  className?: string
}

const Icon16TrashComponent: React.FC<Icon16TrashProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-trash ${className}`} data-name="icon/trash">
      <div className="icon-16-trash-size">
        <svg className="icon-16-trash-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v4M8 7v4M10 7v4M4 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export const Icon16Trash = memo(Icon16TrashComponent)
