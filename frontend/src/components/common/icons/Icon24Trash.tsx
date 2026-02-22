import React from 'react'
import './Icon24Trash.css'

interface Icon24TrashProps {
  className?: string
}

export const Icon24Trash: React.FC<Icon24TrashProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-trash ${className}`} data-name="icon/trash">
      <div className="icon-24-trash-size">
        <svg className="icon-24-trash-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v4M8 7v4M10 7v4M4 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
