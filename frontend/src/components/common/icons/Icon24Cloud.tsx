import React from 'react'
import './Icon24Cloud.css'

interface Icon24CloudProps {
  className?: string
}

export const Icon24Cloud: React.FC<Icon24CloudProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-cloud ${className}`} data-name="icon/cloud">
      <div className="icon-24-cloud-size">
        <svg className="icon-24-cloud-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 10h-1.5A2.5 2.5 0 108 10H4a2 2 0 100 4h8a2 2 0 100-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
