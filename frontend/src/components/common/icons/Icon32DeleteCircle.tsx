import React from 'react'
import './Icon32DeleteCircle.css'

// Icon from Figma - node-id: 282:2124 (Size=32 inside icon/delete, cross, circle)
const iconDeleteCircleImage = 'https://www.figma.com/api/mcp/asset/120f59c0-c4e8-440a-b518-5c299113313c'

interface Icon32DeleteCircleProps {
  className?: string
}

export const Icon32DeleteCircle: React.FC<Icon32DeleteCircleProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-delete-circle ${className}`} data-name="icon/delete, cross, circle" data-node-id="287:4113">
      <div className="icon-32-delete-circle-size" data-name="Size=32" data-node-id="282:2124">
        <div className="icon-32-delete-circle-subtract" data-name="Subtract" data-node-id="287:4120">
          <img alt="delete-circle" className="icon-32-delete-circle-image" src={iconDeleteCircleImage} />
        </div>
      </div>
    </div>
  )
}
