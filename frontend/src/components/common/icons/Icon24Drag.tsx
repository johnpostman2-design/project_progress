import React from 'react'
import './Icon24Drag.css'

// Icon from Figma - node-id: 282:2062 (24/drag)
const iconDragImage = 'https://www.figma.com/api/mcp/asset/72513926-6811-4f58-86cb-d350be010ba9'

interface Icon24DragProps {
  className?: string
}

export const Icon24Drag: React.FC<Icon24DragProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-drag ${className}`} data-name="24/drag" data-node-id="282:2062">
      <div className="icon-24-drag-vector" data-name="Vector" data-node-id="282:2070">
        <img alt="drag" className="icon-24-drag-image" src={iconDragImage} />
      </div>
    </div>
  )
}
