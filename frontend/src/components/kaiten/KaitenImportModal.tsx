import React, { useState, useEffect } from 'react'
import { KaitenGroup, KaitenConfig } from '../../services/kaiten/kaitenTypes'
import { getBoardGroups } from '../../services/kaiten/kaitenApi'
import { KaitenConnectForm } from './KaitenConnectForm'
import { StageListItem } from './StageListItem'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Icon16Link } from '../common/icons/Icon16Link'
import { Icon16Reload } from '../common/icons/Icon16Reload'
import './KaitenImportModal.css'

interface KaitenImportModalProps {
  config: KaitenConfig | null
  onConfigChange?: (config: KaitenConfig) => void
  onImport: (projectName: string, boardId: number, groups: KaitenGroup[], dates: Record<number, { start: Date | null; end: Date | null }>) => void
  onClose: () => void
  onPreviewUpdate?: (groups: KaitenGroup[], dates: Record<number, { start: Date | null; end: Date | null }>, projectName: string, boardId: number | null) => void
  existingProjectId?: string // For rebinding stages
  className?: string
}

export const KaitenImportModal: React.FC<KaitenImportModalProps> = ({
  config,
  onConfigChange,
  onImport,
  onClose,
  onPreviewUpdate,
  existingProjectId,
  className = '',
}) => {
  const [projectName, setProjectName] = useState<string>('')
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [connectFormKey, setConnectFormKey] = useState<number>(0)
  const [localConfig, setLocalConfig] = useState<KaitenConfig | null>(config)
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null)
  const [groups, setGroups] = useState<KaitenGroup[]>([])
  const [dates, setDates] = useState<Record<number, { start: Date | null; end: Date | null }>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Обновляем локальный config при изменении пропса
  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  // Используем локальный config или пропс
  const currentConfig = localConfig || config

  // Обработчик подключения к Kaiten (из формы) - только сохраняем конфигурацию
  const handleKaitenConnect = (newConfig: KaitenConfig) => {
    if (!newConfig.boardId) {
      setError('Не указан ID доски')
      return
    }

    setLocalConfig(newConfig)
    onConfigChange?.(newConfig)
    // Не закрываем форму - показываем кнопку "Загрузить этапы"
  }

  // Загрузка этапов по запросу
  const handleLoadStages = async (config: KaitenConfig) => {
    if (!config.boardId) {
      setError('Не указан ID доски')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const groupsData = await getBoardGroups(config.boardId, config)
      
      if (import.meta.env.DEV) {
        console.log('[KaitenImportModal] Загружены группы:', {
          count: groupsData.length,
          groups: groupsData.map(g => ({ id: g.id, name: g.name })),
        })
      }
      
      setGroups(groupsData)
      setSelectedBoardId(config.boardId)
      
      // Не инициализируем даты - пользователь должен выбрать их вручную
      setDates({})
      // Обновляем предпросмотр (пустой)
      onPreviewUpdate?.(groupsData, {}, projectName, config.boardId)
      
      // Закрываем форму подключения после успешной загрузки
      setShowConnectForm(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось загрузить этапы доски. Проверьте правильность API ключа и ссылки на доску')
      }
      console.error('Kaiten API error:', err)
      throw err // Пробрасываем ошибку, чтобы форма подключения могла её обработать
    } finally {
      setLoading(false)
    }
  }

  // Открытие формы подключения - всегда открываем форму
  const handleOpenKaitenConnect = () => {
    setError(null) // Сбрасываем ошибки
    setConnectFormKey(prev => prev + 1) // Увеличиваем ключ для пересоздания компонента
    setShowConnectForm(true)
    // Не сбрасываем группы и даты, чтобы пользователь мог перепривязать без потери данных
  }

  const handleStageNameChange = (stageId: number, newName: string) => {
    setGroups(groups.map(g => g.id === stageId ? { ...g, name: newName } : g))
  }

  const handleStageStartDateChange = (stageId: number, date: Date | null) => {
    const newDates = {
      ...dates,
      [stageId]: {
        start: date,
        end: dates[stageId]?.end || null,
      },
    }
    setDates(newDates)
    // Обновляем предпросмотр таймлайна
    onPreviewUpdate?.(groups, newDates, projectName, selectedBoardId)
  }

  const handleStageEndDateChange = (stageId: number, date: Date | null) => {
    const newDates = {
      ...dates,
      [stageId]: {
        start: dates[stageId]?.start || null,
        end: date,
      },
    }
    setDates(newDates)
    // Обновляем предпросмотр таймлайна
    onPreviewUpdate?.(groups, newDates, projectName, selectedBoardId)
  }

  const handleStageDelete = (stageId: number) => {
    setGroups(groups.filter(g => g.id !== stageId))
    const newDates = { ...dates }
    delete newDates[stageId]
    setDates(newDates)
  }

  const handleImport = async () => {
    if (import.meta.env.DEV) {
      console.log('[KaitenImportModal] handleImport called', {
        projectName: projectName.trim(),
        selectedBoardId,
        groupsCount: groups.length,
        datesCount: Object.keys(dates).length,
        hasOnImport: typeof onImport === 'function',
      })
    }

    if (!projectName.trim()) {
      alert('Введите название проекта')
      return
    }
    if (!selectedBoardId || groups.length === 0) {
      alert('Подключитесь к Kaiten, нажав кнопку "Привязать"')
      return
    }

    try {
      // Привязываем все группы доски
      console.log('[KaitenImportModal] Calling onImport...')
      const result = onImport(projectName.trim(), selectedBoardId, groups, dates)
      // Если onImport возвращает Promise, ждём завершения
      const promise = result != null && typeof (result as Promise<unknown>).then === 'function' ? (result as Promise<unknown>) : null
      if (promise) {
        await promise
        console.log('[KaitenImportModal] onImport completed successfully')
      } else {
        console.log('[KaitenImportModal] onImport called successfully (not a promise)')
      }
    } catch (error) {
      console.error('[KaitenImportModal] Error calling onImport:', error)
      alert(`Ошибка при создании проекта: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Если открыта форма подключения, показываем её
  if (showConnectForm) {
    return (
      <KaitenConnectForm
        key={`connect-form-${connectFormKey}`}
        onConnect={handleKaitenConnect}
        onLoadStages={handleLoadStages}
        onBack={() => {
          setShowConnectForm(false)
        }}
        existingConfig={currentConfig}
        className={className}
      />
    )
  }


  // Основная форма создания проекта (по макету)
  return (
    <div className={`kaiten-import-modal ${className}`} data-name="new_project-blank" data-node-id="246:900">
      <div className="kaiten-import-modal-content">
        <div className="kaiten-import-modal-section" data-node-id="247:1095">
          <h2 className="kaiten-import-modal-title" data-node-id="246:950">
            {existingProjectId ? 'Перепривязка этапов из Kaiten' : 'Новый проект'}
          </h2>
          <Input
            type="primary"
            size="small"
            placeholder="Название"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="kaiten-import-modal-name-input"
            data-node-id="246:951"
          />
        </div>
        <div className="kaiten-import-modal-section" data-node-id="247:1613">
          <div className="kaiten-import-modal-stages-header" data-node-id="247:1614">
            <label className="kaiten-import-modal-stages-label" data-node-id="247:1615">
              Этапы
            </label>
          </div>
          {groups.length > 0 ? (
            <div className="kaiten-import-modal-stages-list" data-node-id="247:1873">
              {[...groups]
                .sort((a, b) => {
                  const dateA = dates[a.id]?.start
                  const dateB = dates[b.id]?.start
                  if (!dateA && !dateB) return 0
                  if (!dateA) return 1
                  if (!dateB) return -1
                  return dateA.getTime() - dateB.getTime()
                })
                .map((group, index) => (
                  <StageListItem
                    key={group.id}
                    stage={group}
                    stageNumber={index + 1}
                    startDate={dates[group.id]?.start || null}
                    endDate={dates[group.id]?.end || null}
                    onNameChange={handleStageNameChange}
                    onStartDateChange={handleStageStartDateChange}
                    onEndDateChange={handleStageEndDateChange}
                    onDelete={handleStageDelete}
                  />
                ))}
            </div>
          ) : (
            <Button
              type="backless"
              size="small"
              onClick={handleOpenKaitenConnect}
              className="kaiten-import-modal-stages-button"
              data-node-id="247:1616"
            >
              <Icon16Link />
              <span>Привязать</span>
            </Button>
          )}
          {error && (
            <div className="kaiten-import-modal-error">
              {error}
            </div>
          )}
        </div>
        <div className="kaiten-import-modal-footer" data-node-id="248:2355">
          <Button
            type="backless"
            size="small"
            onClick={onClose}
            className="kaiten-import-modal-cancel-button"
            data-node-id="248:2356"
          >
            Отмена
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={handleImport}
            disabled={!projectName.trim() || !selectedBoardId || groups.length === 0 || loading}
            className="kaiten-import-modal-import-button"
            data-node-id="248:2357"
          >
            {loading ? 'Загрузка...' : 'Создать'}
          </Button>
        </div>
      </div>
    </div>
  )
}
