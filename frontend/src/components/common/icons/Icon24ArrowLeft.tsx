import React from 'react'
import './Icon24ArrowLeft.css'

// Icon from Figma - node-id: 287:4082 (Size=24 inside icon/arrow-left)
const iconArrowLeftImage = 'https://www.figma.com/api/mcp/asset/b6a3c62f-7191-44a7-a9dd-1f0ed16f4d50'

interface Icon24ArrowLeftProps {
  className?: string
}

export const Icon24ArrowLeft: React.FC<Icon24ArrowLeftProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-arrow-left ${className}`} data-name="icon/arrow-left" data-node-id="287:4081">
      <div className="icon-24-arrow-left-size" data-name="Size=24" data-node-id="287:4082">
        <div className="icon-24-arrow-left-container" data-name="Vector 1 (Stroke)" data-node-id="287:4083">
          <img alt="arrow-left" className="icon-24-arrow-left-image" src={iconArrowLeftImage} />
        </div>
      </div>
    </div>
  )
}
