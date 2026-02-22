import React from 'react'
import './Icon16ArrowLeft.css'

interface Icon16ArrowLeftProps {
  className?: string
}

export const Icon16ArrowLeft: React.FC<Icon16ArrowLeftProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-arrow-left ${className}`} data-name="icon/arrow-left">
      <div className="icon-16-arrow-left-size">
        <svg className="icon-16-arrow-left-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
