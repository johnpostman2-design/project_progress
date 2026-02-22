import React from 'react'
import './Icon24Minus.css'

interface Icon24MinusProps {
  className?: string
}

export const Icon24Minus: React.FC<Icon24MinusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-minus ${className}`} data-name="icon/minus">
      <div className="icon-24-minus-size">
        <svg className="icon-24-minus-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
