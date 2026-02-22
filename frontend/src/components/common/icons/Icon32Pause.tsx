import React from 'react'
import './Icon32Pause.css'

interface Icon32PauseProps {
  className?: string
}

export const Icon32Pause: React.FC<Icon32PauseProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-pause ${className}`} data-name="24/pause" data-node-id="287:4026">
      <div className="icon-32-pause-size" data-name="Size=32" data-node-id="205:355">
        <div
          className="icon-32-pause-bar icon-32-pause-bar-left"
          data-node-id="205:357"
        />
        <div
          className="icon-32-pause-bar icon-32-pause-bar-right"
          data-node-id="205:359"
        />
      </div>
    </div>
  )
}
