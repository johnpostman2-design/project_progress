import React, { memo } from 'react'
import './Icon24Kebab.css'

interface Icon24KebabProps {
  className?: string
}

const Icon24KebabComponent: React.FC<Icon24KebabProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-kebab ${className}`} data-name="icon/kebab">
      <div className="icon-24-kebab-size">
        <svg className="icon-24-kebab-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="8" cy="4" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export const Icon24Kebab = memo(Icon24KebabComponent)
