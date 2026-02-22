import React from 'react'
import './Icon32Reload.css'

// Icon from Figma - node-id: 248:2339 (Size=32 inside icon/reload)
const iconReloadImage = 'https://www.figma.com/api/mcp/asset/3f16fd57-6411-4f39-bbc2-3d0539175523'

interface Icon32ReloadProps {
  className?: string
}

export const Icon32Reload: React.FC<Icon32ReloadProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-reload ${className}`} data-name="icon/reload" data-node-id="287:4103">
      <div className="icon-32-reload-size" data-name="Size=32" data-node-id="248:2339">
        <div className="icon-32-reload-union" data-name="Union" data-node-id="248:2353">
          <img alt="reload" className="icon-32-reload-image" src={iconReloadImage} />
        </div>
      </div>
    </div>
  )
}
