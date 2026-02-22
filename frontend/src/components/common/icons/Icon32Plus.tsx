import React from 'react'
import './Icon32Plus.css'

// Icon from Figma - node-id: 205:889 (Size=32 inside icon/plus)
const iconPlusImage = 'https://www.figma.com/api/mcp/asset/7dae598e-10f0-4129-b6fc-990ec6103db7'

interface Icon32PlusProps {
  className?: string
}

export const Icon32Plus: React.FC<Icon32PlusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-plus ${className}`} data-name="icon/plus" data-node-id="287:4053">
      <div className="icon-32-plus-size" data-name="Size=32" data-node-id="205:889">
        <div className="icon-32-plus-union" data-name="Union" data-node-id="205:898">
          <img alt="plus" className="icon-32-plus-image" src={iconPlusImage} />
        </div>
      </div>
    </div>
  )
}
