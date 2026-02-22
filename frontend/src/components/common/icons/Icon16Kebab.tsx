import React, { memo } from 'react'
import './Icon16Kebab.css'

interface Icon16KebabProps {
  className?: string
}

const Icon16KebabComponent: React.FC<Icon16KebabProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-kebab ${className}`} data-name="icon/kebab">
      <div className="icon-16-kebab-size">
        <svg className="icon-16-kebab-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="8" cy="4" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export const Icon16Kebab = memo(Icon16KebabComponent)
