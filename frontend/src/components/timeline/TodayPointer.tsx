import React from 'react'
import './TodayPointer.css'

interface TodayPointerProps {
  /** Показывать подпись даты (при hover/выборе таймлайна), иначе — круглый маячок */
  showDateLabel: boolean
  /** Текст даты, например "28 янв" */
  dateLabel: string
  className?: string
}

export const TodayPointer: React.FC<TodayPointerProps> = ({
  showDateLabel,
  dateLabel,
  className = '',
}) => {
  return (
    <div className={`today-pointer ${className}`.trim()} aria-hidden>
      <div className="today-pointer-line" />
      {showDateLabel ? (
        <div className="today-pointer-date">{dateLabel}</div>
      ) : (
        <div className="today-pointer-dot" />
      )}
    </div>
  )
}
