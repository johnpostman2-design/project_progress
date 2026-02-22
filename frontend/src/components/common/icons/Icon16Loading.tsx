import React from 'react'
import './Icon16Loading.css'

interface Icon16LoadingProps {
  className?: string
  spin?: boolean
}

export const Icon16Loading: React.FC<Icon16LoadingProps> = ({ className = '', spin = true }) => {
  return (
    <div className={`icon-16-loading ${spin ? 'icon-16-loading-spin' : ''} ${className}`} data-name="icon/loading">
      <div className="icon-16-loading-size">
        <svg className="icon-16-loading-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="24 12" />
        </svg>
      </div>
    </div>
  )
}
