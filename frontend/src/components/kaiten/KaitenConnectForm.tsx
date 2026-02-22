import React, { useState, useEffect } from 'react'
import { KaitenConfig, KaitenBoard } from '../../services/kaiten/kaitenTypes'
import { getBoards } from '../../services/kaiten/kaitenApi'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { KaitenBoardSelector } from './KaitenBoardSelector'
import './KaitenConnectForm.css'

interface KaitenConnectFormProps {
  onConnect: (config: KaitenConfig) => void
  onLoadStages?: (config: KaitenConfig) => Promise<void>
  onBack: () => void
  className?: string
  existingConfig?: KaitenConfig | null
}

export const KaitenConnectForm: React.FC<KaitenConnectFormProps> = ({
  onConnect,
  onLoadStages,
  onBack,
  className = '',
  existingConfig,
}) => {
  const [apiKey, setApiKey] = useState<string>(existingConfig?.apiKey || '')
  const [domain, setDomain] = useState<string>(existingConfig?.domain || 'onyagency')
  const [boards, setBoards] = useState<KaitenBoard[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(existingConfig?.boardId || null)
  const [loadingBoards, setLoadingBoards] = useState(false)
  const [connectedConfig, setConnectedConfig] = useState<KaitenConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Сбрасываем connectedConfig при изменении existingConfig, чтобы можно было перепривязать
  useEffect(() => {
    setConnectedConfig(existingConfig || null)
  }, [existingConfig])

  // Загрузка списка досок
  const handleLoadBoards = async () => {
    if (!apiKey.trim()) {
      setError('Введите API ключ')
      return
    }

    if (!domain.trim()) {
      setError('Введите домен Kaiten')
      return
    }

    try {
      setLoadingBoards(true)
      setError(null)
      
      // Очищаем домен от .kaiten.ru если пользователь ввел полный домен
      let cleanDomain = domain.trim()
      cleanDomain = cleanDomain.replace(/\.kaiten\.ru$/, '') // Убираем .kaiten.ru если есть
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '') // Убираем протокол если есть
      cleanDomain = cleanDomain.split('/')[0] // Берем только домен без пути
      cleanDomain = cleanDomain.split('.')[0] // Берем только первую часть (например, onyagency из onyagency.kaiten.ru)
      
      const tempConfig: KaitenConfig = {
        domain: cleanDomain,
        apiKey: apiKey.trim(),
      }
      
      const boardsList = await getBoards(tempConfig)
      setBoards(boardsList)
      
      if (boardsList.length === 0) {
        setError('Не найдено досок, доступных для вашего API ключа')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось загрузить список досок. Проверьте правильность API ключа и домена')
      }
    } finally {
      setLoadingBoards(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Валидация
    if (!apiKey.trim()) {
      setError('Введите API ключ')
      return
    }

    if (!domain.trim()) {
      setError('Введите домен Kaiten')
      return
    }

    if (!selectedBoardId) {
      setError('Выберите доску из списка')
      return
    }

    // Находим выбранную доску, чтобы получить space_id
    const selectedBoard = boards.find(b => b.id === selectedBoardId)
    const spaceId = selectedBoard?.space_id

    // Создаем конфигурацию
    const config: KaitenConfig = {
      domain: domain.trim(),
      apiKey: apiKey.trim(),
      boardId: selectedBoardId,
      spaceId: spaceId, // Добавляем space_id, если доска была выбрана из списка
    }

    setConnectedConfig(config)
    onConnect(config)
    
    // Автоматически загружаем этапы после подключения
    if (onLoadStages) {
      try {
        setLoading(true)
        setError(null)
        await onLoadStages(config)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Не удалось загрузить этапы доски')
        }
        setLoading(false)
      }
    }
  }

  // Загрузка этапов после подключения
  const handleLoadStages = async () => {
    if (!connectedConfig?.boardId) {
      setError('Сначала подключитесь к Kaiten')
      return
    }

    if (onLoadStages) {
      try {
        setLoading(true)
        setError(null)
        await onLoadStages(connectedConfig)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Не удалось загрузить этапы доски')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className={`kaiten-connect-form ${className}`}>
      <div className="kaiten-connect-form-content">
        <h2 className="kaiten-connect-form-title">Подключение к Kaiten</h2>
        
        <form onSubmit={handleSubmit} className="kaiten-connect-form-fields">
          <div className="kaiten-connect-form-field">
            <label className="kaiten-connect-form-label">
              Домен Kaiten
            </label>
            <Input
              type="primary"
              size="small"
              placeholder="onyagency"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              inputType="text"
            />
            <p className="kaiten-connect-form-hint">
              Домен вашего Kaiten (например: onyagency)
            </p>
          </div>

          <div className="kaiten-connect-form-field">
            <label className="kaiten-connect-form-label">
              API ключ
            </label>
            <Input
              type="primary"
              size="small"
              placeholder="Введите API ключ"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              inputType="password"
            />
            <Button
              type="backless"
              size="small"
              onClick={handleLoadBoards}
              disabled={loadingBoards || !apiKey.trim() || !domain.trim()}
              className="kaiten-connect-form-load-boards-button"
            >
              {loadingBoards ? 'Загрузка...' : 'Загрузить список досок'}
            </Button>
          </div>

          {boards.length > 0 && (
            <div className="kaiten-connect-form-field">
              <label className="kaiten-connect-form-label">
                Выберите доску
              </label>
              <KaitenBoardSelector
                boards={boards}
                selectedBoardId={selectedBoardId || undefined}
                onSelect={(board) => setSelectedBoardId(board.id)}
                loading={loadingBoards}
              />
            </div>
          )}

          {error && (
            <div className="kaiten-connect-form-error">{error}</div>
          )}

          <div className="kaiten-connect-form-footer">
            <Button
              type="backless"
              size="small"
              onClick={onBack}
              buttonType="button"
            >
              Назад
            </Button>
            {connectedConfig && onLoadStages ? (
              <Button
                type="primary"
                size="small"
                onClick={handleLoadStages}
                disabled={loading}
                buttonType="button"
              >
                {loading ? 'Загрузка...' : 'Подключить'}
              </Button>
            ) : (
              <Button
                type="primary"
                size="small"
                buttonType="submit"
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Подключиться'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
