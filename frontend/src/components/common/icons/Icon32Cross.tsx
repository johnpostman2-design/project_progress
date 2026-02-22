import React from 'react'
import './Icon32Cross.css'

// Icon from Figma - node-id: 282:2115 (Size=32 inside icon/cross, delete)
const iconCrossImage = 'https://www.figma.com/api/mcp/asset/e80c0993-77d1-43a2-b46e-11442ea73eb9'

interface Icon32CrossProps {
  className?: string
}

export const Icon32Cross: React.FC<Icon32CrossProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-cross ${className}`} data-name="icon/cross, delete" data-node-id="287:4108">
      <div className="icon-32-cross-size" data-name="Size=32" data-node-id="282:2115">
        <div className="icon-32-cross-union" data-name="Union" data-node-id="282:2114">
          <img alt="cross" className="icon-32-cross-image" src={iconCrossImage} />
        </div>
      </div>
    </div>
  )
}
