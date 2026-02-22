import React from 'react'
import './Icon32Link.css'

// Icon from Figma - node-id: 247:1210 (Size=32 inside icon/link, chain)
const iconLinkImage = 'https://www.figma.com/api/mcp/asset/af2099fd-4dee-4dd1-8d34-802e73f9398b'

interface Icon32LinkProps {
  className?: string
}

export const Icon32Link: React.FC<Icon32LinkProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-link ${className}`} data-name="icon/link, chain" data-node-id="287:4093">
      <div className="icon-32-link-size" data-name="Size=32" data-node-id="247:1210">
        <div className="icon-32-link-vector" data-name="Vector" data-node-id="247:1215">
          <img alt="link" className="icon-32-link-image" src={iconLinkImage} />
        </div>
      </div>
    </div>
  )
}
