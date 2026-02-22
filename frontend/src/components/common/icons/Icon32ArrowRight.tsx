import React from 'react'
import './Icon32ArrowRight.css'

// Icon from Figma - node-id: 228:781 (Size=32 inside icon/arrow-right)
const iconArrowRightImage = 'https://www.figma.com/api/mcp/asset/f969cfd0-cfbe-444f-8155-bd615158160f'

interface Icon32ArrowRightProps {
  className?: string
}

export const Icon32ArrowRight: React.FC<Icon32ArrowRightProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-arrow-right ${className}`} data-name="icon/arrow-right" data-node-id="287:4086">
      <div className="icon-32-arrow-right-size" data-name="Size=32" data-node-id="228:781">
        <div className="icon-32-arrow-right-vector" data-name="Vector 1 (Stroke)" data-node-id="228:780">
          <img alt="arrow-right" className="icon-32-arrow-right-image" src={iconArrowRightImage} />
        </div>
      </div>
    </div>
  )
}
