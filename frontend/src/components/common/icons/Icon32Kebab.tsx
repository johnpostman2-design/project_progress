import React from 'react'
import './Icon32Kebab.css'

// Icon from Figma - node-id: 205:3516 (Size=32 inside icon/kebab, menu, more)
const iconKebabImage = 'https://www.figma.com/api/mcp/asset/fdfc277e-50d0-4f7e-bc11-e246059f3045'

interface Icon32KebabProps {
  className?: string
}

export const Icon32Kebab: React.FC<Icon32KebabProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-kebab ${className}`} data-name="icon/kebab, menu, more" data-node-id="287:4070">
      <div className="icon-32-kebab-size" data-name="Size=32" data-node-id="205:3516">
        <div className="icon-32-kebab-union" data-name="Union" data-node-id="205:3524">
          <img alt="kebab" className="icon-32-kebab-image" src={iconKebabImage} />
        </div>
      </div>
    </div>
  )
}
