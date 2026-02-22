import React from 'react'
import './Icon24Cross.css'

interface Icon24CrossProps {
  className?: string
}

export const Icon24Cross: React.FC<Icon24CrossProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-cross ${className}`} data-name="icon/cross">
      <div className="icon-24-cross-size">
        <svg className="icon-24-cross-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
