import React from 'react'
import './Icon16Cross.css'

interface Icon16CrossProps {
  className?: string
}

export const Icon16Cross: React.FC<Icon16CrossProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-cross ${className}`} data-name="icon/cross">
      <div className="icon-16-cross-size">
        <svg className="icon-16-cross-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
