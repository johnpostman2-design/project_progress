import React from 'react'
import './Icon24Chart.css'

interface Icon24ChartProps {
  className?: string
}

export const Icon24Chart: React.FC<Icon24ChartProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-chart ${className}`} data-name="icon/chart" data-node-id="287:4001">
      <div className="icon-24-chart-size" data-name="Size=24" data-node-id="287:4006">
        <div className="icon-24-chart-bar icon-24-chart-bar-1" data-node-id="287:4007" />
        <div className="icon-24-chart-bar icon-24-chart-bar-2" data-node-id="287:4008" />
        <div className="icon-24-chart-bar icon-24-chart-bar-3" data-node-id="287:4009" />
      </div>
    </div>
  )
}
