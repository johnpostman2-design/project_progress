import React from 'react'
import './Icon24Pause.css'

interface Icon24PauseProps {
  className?: string
}

export const Icon24Pause: React.FC<Icon24PauseProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-pause ${className}`} data-name="24/pause" data-node-id="287:4026">
      <div className="icon-24-pause-size" data-name="Size=24" data-node-id="287:4027">
        <div
          className="icon-24-pause-bar icon-24-pause-bar-left"
          data-node-id="287:4028"
        />
        <div
          className="icon-24-pause-bar icon-24-pause-bar-right"
          data-node-id="287:4029"
        />
      </div>
    </div>
  )
}
