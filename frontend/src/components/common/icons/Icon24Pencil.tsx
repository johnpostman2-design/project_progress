import React from 'react'
import './Icon24Pencil.css'

// Icon from Figma - node-id: 287:4049 (Size=24 inside icon/pencil, edit)
const iconPencilImage = 'https://www.figma.com/api/mcp/asset/a39eaa21-55fd-4b87-979d-081bf949dfaa'

interface Icon24PencilProps {
  className?: string
}

export const Icon24Pencil: React.FC<Icon24PencilProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-pencil ${className}`} data-name="icon/pencil, edit" data-node-id="287:4048">
      <div className="icon-24-pencil-size" data-name="Size=24" data-node-id="287:4049">
        <div className="icon-24-pencil-subtract" data-name="Subtract" data-node-id="287:4050">
          <img alt="pencil" className="icon-24-pencil-image" src={iconPencilImage} />
        </div>
      </div>
    </div>
  )
}
