import React from 'react'
import './Icon32Pencil.css'

// Icon from Figma - node-id: 205:408 (Size=32 inside icon/pencil, edit)
const iconPencilImage = 'https://www.figma.com/api/mcp/asset/29aaa8af-e27d-484b-b1b9-5875ae35d448'

interface Icon32PencilProps {
  className?: string
}

export const Icon32Pencil: React.FC<Icon32PencilProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-pencil ${className}`} data-name="icon/pencil, edit" data-node-id="287:4048">
      <div className="icon-32-pencil-size" data-name="Size=32" data-node-id="205:408">
        <div className="icon-32-pencil-subtract" data-name="Subtract" data-node-id="205:436">
          <img alt="pencil" className="icon-32-pencil-image" src={iconPencilImage} />
        </div>
      </div>
    </div>
  )
}
