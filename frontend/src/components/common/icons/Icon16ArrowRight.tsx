import React from 'react'
import './Icon16ArrowRight.css'

interface Icon16ArrowRightProps {
  className?: string
}

export const Icon16ArrowRight: React.FC<Icon16ArrowRightProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-arrow-right ${className}`} data-name="icon/arrow-right">
      <div className="icon-16-arrow-right-size">
        <svg className="icon-16-arrow-right-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
