import React, { memo } from 'react'
import './Icon16Minus.css'

interface Icon16MinusProps {
  className?: string
}

const Icon16MinusComponent: React.FC<Icon16MinusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-minus ${className}`} data-name="icon/minus">
      <div className="icon-16-minus-size">
        <svg className="icon-16-minus-svg" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

export const Icon16Minus = memo(Icon16MinusComponent)
