import React, { memo } from 'react'
import './Icon16Plus.css'

interface Icon16PlusProps {
  className?: string
}

const Icon16PlusComponent: React.FC<Icon16PlusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-plus ${className}`} data-name="icon/plus">
      <div className="icon-16-plus-size">
        <svg className="icon-16-plus-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

export const Icon16Plus = memo(Icon16PlusComponent)
