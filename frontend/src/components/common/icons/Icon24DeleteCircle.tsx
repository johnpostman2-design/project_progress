import React from 'react'
import './Icon24DeleteCircle.css'

interface Icon24DeleteCircleProps {
  className?: string
}

export const Icon24DeleteCircle: React.FC<Icon24DeleteCircleProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-delete-circle ${className}`} data-name="icon/delete-circle">
      <div className="icon-24-delete-circle-size">
        <svg className="icon-24-delete-circle-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
