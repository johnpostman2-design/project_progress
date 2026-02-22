import React from 'react'
import { KaitenGroup } from '../../services/kaiten/kaitenTypes'
import { Icon24Link } from '../common/icons/Icon24Link'
import { Button } from '../common/Button'
import './KaitenStagePreview.css'

interface KaitenStagePreviewProps {
  groups: KaitenGroup[]
  selectedGroupIds?: number[]
  onToggleGroup: (groupId: number) => void
  loading?: boolean
  className?: string
}

export const KaitenStagePreview: React.FC<KaitenStagePreviewProps> = ({
  groups,
  selectedGroupIds = [],
  onToggleGroup,
  loading = false,
  className = '',
}) => {
  // В режиме подключения к Kaiten показываем список этапов для выбора
  if (groups.length > 0) {
    return (
      <div className={`kaiten-stage-preview ${className}`}>
        {loading && <div className="kaiten-stage-preview-loading">Загрузка этапов...</div>}
        {groups.map((group) => (
          <div key={group.id} className="kaiten-stage-preview-item">
            <label className="kaiten-stage-preview-checkbox">
              <input
                type="checkbox"
                checked={selectedGroupIds.includes(group.id)}
                onChange={() => onToggleGroup(group.id)}
              />
              <span>{group.name}</span>
            </label>
          </div>
        ))}
      </div>
    )
  }

  // Если этапов нет, но идет загрузка
  if (loading) {
    return <div className={`kaiten-stage-preview loading ${className}`}>Загрузка этапов...</div>
  }

  // Если этапов нет и не идет загрузка - ничего не показываем
  return null
}
