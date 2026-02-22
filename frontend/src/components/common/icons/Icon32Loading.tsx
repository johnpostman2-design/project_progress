import React from 'react'
import './Icon32Loading.css'

// Icon from Figma - node-id: 89:72 (Size=32 inside icon/loading)
const iconLoadingImage = 'https://www.figma.com/api/mcp/asset/4376f427-d3e2-472e-b63e-0d47cab9da75'

interface Icon32LoadingProps {
  className?: string
}

export const Icon32Loading: React.FC<Icon32LoadingProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-loading ${className}`} data-name="icon/loading" data-node-id="287:4019">
      <div className="icon-32-loading-size" data-name="Size=32" data-node-id="89:72">
        <div className="icon-32-loading-union" data-name="Union" data-node-id="205:805">
          <img alt="loading" className="icon-32-loading-image" src={iconLoadingImage} />
        </div>
      </div>
    </div>
  )
}
