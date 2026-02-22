import React from 'react'
import './Icon32Trash.css'

// Icon from Figma - node-id: 247:2237 (Size=32 inside icon/trash, bin, delete)
const iconTrashImage = 'https://www.figma.com/api/mcp/asset/776f05ca-8dc3-4b95-af1c-6339a42bef7c'

interface Icon32TrashProps {
  className?: string
}

export const Icon32Trash: React.FC<Icon32TrashProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-trash ${className}`} data-name="icon/trash, bin, delete" data-node-id="287:4098">
      <div className="icon-32-trash-size" data-name="Size=32" data-node-id="247:2237">
        <div className="icon-32-trash-union" data-name="Union" data-node-id="247:2246">
          <img alt="trash" className="icon-32-trash-image" src={iconTrashImage} />
        </div>
      </div>
    </div>
  )
}
