import React from 'react'
import './Icon16Cloud.css'

interface Icon16CloudProps {
  className?: string
}

export const Icon16Cloud: React.FC<Icon16CloudProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-cloud ${className}`} data-name="icon/cloud">
      <div className="icon-16-cloud-size">
        <svg className="icon-16-cloud-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 10h-1.5A2.5 2.5 0 108 10H4a2 2 0 100 4h8a2 2 0 100-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
