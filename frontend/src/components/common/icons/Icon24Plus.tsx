import React from 'react'
import './Icon24Plus.css'

interface Icon24PlusProps {
  className?: string
}

export const Icon24Plus: React.FC<Icon24PlusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-plus ${className}`} data-name="icon/plus">
      <div className="icon-24-plus-size">
        <svg className="icon-24-plus-svg" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
