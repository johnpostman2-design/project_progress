import React, { memo } from 'react'
import './Icon16Reload.css'

interface Icon16ReloadProps {
  className?: string
}

const Icon16ReloadComponent: React.FC<Icon16ReloadProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-reload ${className}`} data-name="icon/reload">
      <div className="icon-16-reload-size">
        <svg className="icon-16-reload-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M14 8a6 6 0 01-10 4.5L2 11l2-3 2 1.5A3.5 3.5 0 108 4.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export const Icon16Reload = memo(Icon16ReloadComponent)
