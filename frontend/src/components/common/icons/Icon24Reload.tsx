import React from 'react'
import './Icon24Reload.css'

// Icon from Figma - node-id: 287:4104 (Size=24 inside icon/reload)
const iconReloadImage = 'https://www.figma.com/api/mcp/asset/5c06bec7-b443-41d1-afa1-1147230a8e08'

interface Icon24ReloadProps {
  className?: string
}

export const Icon24Reload: React.FC<Icon24ReloadProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-reload ${className}`} data-name="icon/reload" data-node-id="287:4103">
      <div className="icon-24-reload-size" data-name="Size=24" data-node-id="287:4104">
        <div className="icon-24-reload-union" data-name="Union" data-node-id="287:4105">
          <img alt="reload" className="icon-24-reload-image" src={iconReloadImage} />
        </div>
      </div>
    </div>
  )
}
