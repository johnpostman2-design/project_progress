import React from 'react'
import './Icon16Link.css'

interface Icon16LinkProps {
  className?: string
}

export const Icon16Link: React.FC<Icon16LinkProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-link ${className}`} data-name="icon/link">
      <div className="icon-16-link-size">
        <svg className="icon-16-link-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M6 9l1-1a2 2 0 012.8 0l.4.4a2 2 0 010 2.8l-1 1M10 7l-1 1a2 2 0 01-2.8 0l-.4-.4a2 2 0 010-2.8l1-1M5 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
