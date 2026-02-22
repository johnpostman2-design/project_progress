import React, { memo } from 'react'
import './Icon16Check.css'

/** Иконка check/done Size=16 из Figma UI-kit (117:260). Контейнер как у всех иконок. Цвет через currentColor. */
const Icon16CheckComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`icon-16-check ${className}`}
      data-name="icon/check, done"
      data-node-id="117:260"
      data-figma-size="16"
    >
      <div className="icon-16-check-size" data-name="Size=16">
        <div className="icon-16-check-vector" data-name="Vector (Stroke)">
          <svg
            className="icon-16-check-svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M13 4L6 11L3 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export const Icon16Check = memo(Icon16CheckComponent)
