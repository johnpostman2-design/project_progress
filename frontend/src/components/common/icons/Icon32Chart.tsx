import React from 'react'
import './Icon32Chart.css'

interface Icon32ChartProps {
  className?: string
}

export const Icon32Chart: React.FC<Icon32ChartProps> = ({ className = '' }) => {
  return (
    <div className={`icon-32-chart ${className}`} data-name="icon/chart" data-node-id="287:4001">
      <div className="icon-32-chart-size" data-name="Size=32" data-node-id="76:49">
        <div className="icon-32-chart-bar icon-32-chart-bar-1" data-node-id="205:438" />
        <div className="icon-32-chart-bar icon-32-chart-bar-2" data-node-id="205:513" />
        <div className="icon-32-chart-bar icon-32-chart-bar-3" data-node-id="205:588" />
      </div>
    </div>
  )
}
