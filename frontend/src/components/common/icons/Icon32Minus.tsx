import React from 'react'
import './Icon32Minus.css'

// Icon from Figma - node-id: 247:1040 (Size=32 inside icon/minus)
const iconMinusImage = 'https://www.figma.com/api/mcp/asset/05717524-28dd-419b-9afb-bee6fd474a81'

interface Icon32MinusProps {
  className?: string
}

export const Icon32Minus: React.FC<Icon32MinusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-minus ${className}`} data-name="icon/minus" data-node-id="287:4060">
      <div className="icon-32-minus-size" data-name="Size=32" data-node-id="247:1040">
        <div className="icon-32-minus-union" data-name="Union" data-node-id="247:1039">
          <img alt="minus" className="icon-32-minus-image" src={iconMinusImage} />
        </div>
      </div>
    </div>
  )
}
