import React from 'react'
import './Icon16Chart.css'

interface Icon16ChartProps {
  className?: string
}

export const Icon16Chart: React.FC<Icon16ChartProps> = ({ className = '' }) => {
  return (
    <div className={`icon-16-chart ${className}`} data-name="icon/chart" data-node-id="287:4001">
      <div className="icon-16-chart-size" data-name="Size=16" data-node-id="287:4002">
        <div className="icon-16-chart-bar icon-16-chart-bar-1" data-node-id="287:4003" />
        <div className="icon-16-chart-bar icon-16-chart-bar-2" data-node-id="287:4004" />
        <div className="icon-16-chart-bar icon-16-chart-bar-3" data-node-id="287:4005" />
      </div>
    </div>
  )
}
