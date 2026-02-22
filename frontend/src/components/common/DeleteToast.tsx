import React, { useState, useImperativeHandle, useRef, useEffect } from 'react'
import { Button } from './Button'
import './DeleteToast.css'

export interface DeleteToastRef {
  show: (projectName: string, onUndo: () => void, onExpire?: () => void) => void
  /** Toast с отсчётом и отменой (для удаления всех проектов) */
  showWithUndo: (message: string, onUndo: () => void, onExpire?: () => void) => void
  /** Простое уведомление без отмены */
  showMessage: (message: string, durationMs?: number) => void
}

const DURATION_MS = 5000

export const DeleteToast = React.forwardRef<DeleteToastRef>((_, ref) => {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(1)
  const [, forceUpdate] = useState(0)
  const [withUndo, setWithUndo] = useState(false)
  const onUndoRef = useRef<() => void>(() => {})
  const onExpireRef = useRef<(() => void) | undefined>(undefined)
  const timerRef = useRef<number | null>(null)
  const frameRef = useRef<number>(0)
  const progressRef = useRef(1)

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }

  useImperativeHandle(ref, () => ({
    showMessage: (msg: string, durationMs = 3000) => {
      clearTimer()
      setMessage(msg)
      setWithUndo(false)
      onUndoRef.current = () => {}
      onExpireRef.current = undefined
      setVisible(true)
      setProgress(1)
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setVisible(false)
      }, durationMs)
    },
    showWithUndo: (msg: string, onUndo: () => void, onExpire?: () => void) => {
      clearTimer()
      setMessage(msg)
      setWithUndo(true)
      onUndoRef.current = onUndo
      onExpireRef.current = onExpire
      progressRef.current = 1
      setVisible(true)
      setProgress(1)
      const startTime = Date.now()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setVisible(false)
        onExpireRef.current?.()
      }, DURATION_MS)
      const animate = () => {
        const elapsed = Date.now() - startTime
        const p = Math.max(0, 1 - elapsed / DURATION_MS)
        progressRef.current = p
        setProgress(p)
        forceUpdate((n) => n + 1)
        if (p > 0) frameRef.current = requestAnimationFrame(animate)
      }
      frameRef.current = requestAnimationFrame(animate)
    },
    show: (projectName: string, onUndo: () => void, onExpire?: () => void) => {
      clearTimer()
      setMessage(`Проект ${projectName} удален`)
      setWithUndo(true)
      onUndoRef.current = onUndo
      onExpireRef.current = onExpire
      progressRef.current = 1
      setVisible(true)
      setProgress(1)
      const startTime = Date.now()

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setVisible(false)
        onExpireRef.current?.()
      }, DURATION_MS)

      const animate = () => {
        const elapsed = Date.now() - startTime
        const p = Math.max(0, 1 - elapsed / DURATION_MS)
        progressRef.current = p
        setProgress(p)
        forceUpdate((n) => n + 1)
        if (p > 0) frameRef.current = requestAnimationFrame(animate)
      }
      frameRef.current = requestAnimationFrame(animate)
    },
  }))

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const handleUndo = () => {
    clearTimer()
    setVisible(false)
    onUndoRef.current()
  }

  if (!visible) return null

  const circumference = 2 * Math.PI * 12
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="delete-toast">
      <span className="delete-toast-message">{message}</span>
      {withUndo && (
      <div className="delete-toast-progress-wrap">
        <svg className="delete-toast-progress" viewBox="0 0 28 28">
          <circle
            className="delete-toast-progress-bg"
            cx="14"
            cy="14"
            r="12"
            fill="none"
            strokeWidth="2"
          />
          <circle
            className="delete-toast-progress-fill"
            cx="14"
            cy="14"
            r="12"
            fill="none"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 14 14)"
          />
        </svg>
      </div>
      )}
      {withUndo && (
      <Button type="text" size="small" onClick={handleUndo} className="delete-toast-undo">
        Отмена
      </Button>
      )}
    </div>
  )
})

DeleteToast.displayName = 'DeleteToast'
