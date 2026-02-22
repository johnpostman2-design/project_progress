import React from 'react'
import './Icon24ArrowRight.css'

// Icon from Figma - node-id: 287:4087 (Size=24 inside icon/arrow-right)
const iconArrowRightImage = 'https://www.figma.com/api/mcp/asset/6cad8a10-db73-433c-a73d-afdfe2e0b276'

interface Icon24ArrowRightProps {
  className?: string
}

export const Icon24ArrowRight: React.FC<Icon24ArrowRightProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-arrow-right ${className}`} data-name="icon/arrow-right" data-node-id="287:4086">
      <div className="icon-24-arrow-right-size" data-name="Size=24" data-node-id="287:4087">
        <div className="icon-24-arrow-right-vector" data-name="Vector 1 (Stroke)" data-node-id="287:4088">
          <img alt="arrow-right" className="icon-24-arrow-right-image" src={iconArrowRightImage} />
        </div>
      </div>
    </div>
  )
}
