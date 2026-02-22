import React from 'react'
import './Icon32Check.css'

// Icon from Figma - node-id: 205:911 (Size=32 inside icon/check, done)
const iconCheckImage = 'https://www.figma.com/api/mcp/asset/cd9867d2-7d68-4454-9479-2176d51332b9'

interface Icon32CheckProps {
  className?: string
}

export const Icon32Check: React.FC<Icon32CheckProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-check ${className}`} data-name="icon/check, done" data-node-id="287:4065">
      <div className="icon-32-check-size" data-name="Size=32" data-node-id="205:911">
        <div className="icon-32-check-vector" data-name="Vector (Stroke)" data-node-id="205:922">
          <img alt="check" className="icon-32-check-image" src={iconCheckImage} />
        </div>
      </div>
    </div>
  )
}
