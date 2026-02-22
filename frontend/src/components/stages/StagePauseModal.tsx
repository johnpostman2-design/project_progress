import React, { useState } from 'react'

interface StagePauseModalProps {
  stageName: string
  currentReason?: string
  onSave: (reason: string) => void
  onCancel: () => void
  className?: string
}

export const StagePauseModal: React.FC<StagePauseModalProps> = ({
  stageName,
  currentReason = '',
  onSave,
  onCancel,
  className = '',
}) => {
  const [reason, setReason] = useState(currentReason)

  const handleSave = () => {
    if (!reason.trim()) {
      alert('Причина паузы обязательна')
      return
    }
    onSave(reason.trim())
  }

  return (
    <div className={`stage-pause-modal-overlay ${className}`} onClick={onCancel}>
      <div className="stage-pause-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Поставить этап "{stageName}" на паузу</h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <label>
            Причина паузы:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Укажите причину паузы..."
              rows={4}
            />
          </label>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel}>Отмена</button>
          <button onClick={handleSave} disabled={!reason.trim()}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
