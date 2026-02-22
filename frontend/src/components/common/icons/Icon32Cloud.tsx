import React from 'react'
import './Icon32Cloud.css'

// Icon from Figma - node-id: 76:91 (Size=32 inside icon/cloud)
const iconCloudImage = 'https://www.figma.com/api/mcp/asset/2e77536c-0ef9-4dc9-9025-32cbcbf577e0'

interface Icon32CloudProps {
  className?: string
}

export const Icon32Cloud: React.FC<Icon32CloudProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-cloud ${className}`} data-name="icon/cloud" data-node-id="287:4010">
      <div className="icon-32-cloud-size" data-name="Size=32" data-node-id="76:91">
        <div className="icon-32-cloud-vector" data-name="Vector (Stroke)" data-node-id="121:806">
          <img alt="cloud" className="icon-32-cloud-image" src={iconCloudImage} />
        </div>
      </div>
    </div>
  )
}
