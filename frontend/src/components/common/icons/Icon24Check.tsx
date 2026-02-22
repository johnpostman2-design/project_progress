import React from 'react'
import './Icon24Check.css'

interface Icon24CheckProps {
  className?: string
}

export const Icon24Check: React.FC<Icon24CheckProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-check ${className}`} data-name="icon/check">
      <div className="icon-24-check-size">
        <svg className="icon-24-check-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
