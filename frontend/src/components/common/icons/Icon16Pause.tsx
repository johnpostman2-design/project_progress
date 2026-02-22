import React, { memo } from 'react'
import './Icon16Pause.css'

interface Icon16PauseProps {
  className?: string
}

const Icon16PauseComponent: React.FC<Icon16PauseProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-pause ${className}`} data-name="24/pause" data-node-id="287:4026">
      <div className="icon-16-pause-size" data-name="Size=16" data-node-id="287:4036">
        <div
          className="icon-16-pause-bar icon-16-pause-bar-left"
          data-node-id="287:4037"
        />
        <div
          className="icon-16-pause-bar icon-16-pause-bar-right"
          data-node-id="287:4038"
        />
      </div>
    </div>
  )
}

export const Icon16Pause = memo(Icon16PauseComponent)
