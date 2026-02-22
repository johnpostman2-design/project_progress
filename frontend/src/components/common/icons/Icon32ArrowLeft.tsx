import React from 'react'
import './Icon32ArrowLeft.css'

// Icon from Figma - node-id: 228:465 (Size=32 inside icon/arrow-left)
const iconArrowLeftImage = 'https://www.figma.com/api/mcp/asset/ed733ab5-6a00-4a34-b94b-7911f048f04e'

interface Icon32ArrowLeftProps {
  className?: string
}

export const Icon32ArrowLeft: React.FC<Icon32ArrowLeftProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-arrow-left ${className}`} data-name="icon/arrow-left" data-node-id="287:4081">
      <div className="icon-32-arrow-left-size" data-name="Size=32" data-node-id="228:465">
        <div className="icon-32-arrow-left-container" data-name="Vector 1 (Stroke)" data-node-id="228:471">
          <img alt="arrow-left" className="icon-32-arrow-left-image" src={iconArrowLeftImage} />
        </div>
      </div>
    </div>
  )
}
