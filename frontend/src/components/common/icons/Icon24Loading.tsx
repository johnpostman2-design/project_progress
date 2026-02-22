import React from 'react'
import './Icon24Loading.css'

// Icon from Figma - node-id: 287:4020 (Size=24 inside icon/loading)
const iconLoadingImage = 'https://www.figma.com/api/mcp/asset/9ac5dc78-ac54-490d-8523-e4880cf08529'

interface Icon24LoadingProps {
  className?: string
  spin?: boolean
}

export const Icon24Loading: React.FC<Icon24LoadingProps> = ({ className = '', spin = true }) => {
  return (
    <div className={`icon-24-loading ${spin ? 'icon-24-loading-spin' : ''} ${className}`} data-name="icon/loading" data-node-id="287:4019">
      <div className="icon-24-loading-size" data-name="Size=24" data-node-id="287:4020">
        <div className="icon-24-loading-union" data-name="Union" data-node-id="287:4021">
          <img alt="loading" className="icon-24-loading-image" src={iconLoadingImage} />
        </div>
      </div>
    </div>
  )
}
