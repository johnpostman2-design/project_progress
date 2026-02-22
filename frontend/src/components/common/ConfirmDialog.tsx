import React from 'react'
import { Button } from './Button'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message = '',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  className = '',
}) => {
  return (
    <div className={`confirm-dialog-overlay ${className}`} onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        {message ? (
          <div className="confirm-dialog-body">
            <p className="confirm-dialog-message">{message}</p>
          </div>
        ) : null}
        <div className="confirm-dialog-footer">
          <Button
            type="secondary"
            size="small"
            onClick={onCancel}
            className="confirm-dialog-cancel-button"
          >
            {cancelText}
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={onConfirm}
            className={`confirm-dialog-confirm-button ${confirmVariant === 'danger' ? 'confirm-dialog-confirm-danger' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
