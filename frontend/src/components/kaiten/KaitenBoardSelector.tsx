import React, { useState, useCallback } from 'react'
import { KaitenBoard } from '../../services/kaiten/kaitenTypes'
import '../common/Input.css'
import './KaitenBoardSelector.css'

interface KaitenBoardSelectorProps {
  boards: KaitenBoard[]
  selectedBoardId?: number
  onSelect: (board: KaitenBoard) => void
  loading?: boolean
  className?: string
  /** Управление из родителя: поиск и список всегда синхронны */
  searchQuery: string
  onSearchQueryChange: (value: string) => void
}

export const KaitenBoardSelector: React.FC<KaitenBoardSelectorProps> = ({
  boards,
  selectedBoardId,
  onSelect,
  loading = false,
  className = '',
  searchQuery,
  onSearchQueryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  // Локальный state: название выбранной доски, чтобы не пропадало после клика (не зависим от родителя)
  const [selectedName, setSelectedName] = useState('')

  const selectedBoard = boards.find((b) => b.id === selectedBoardId)

  // По умолчанию пусто (плейсхолдер). При выборе — название доски. Не подставляем доску из пропсов.
  const inputValue = isOpen ? (searchQuery || selectedName) : (selectedName || searchQuery)
  const hasValue = inputValue.trim().length > 0

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedName('')
      onSearchQueryChange(e.target.value)
      setIsOpen(true)
    },
    [onSearchQueryChange]
  )

  const handleFocus = useCallback(() => {
    if (hasValue) {
      setSelectedName('')
      onSearchQueryChange('')
    }
    setIsOpen(true)
  }, [hasValue, onSearchQueryChange])

  // Фильтр по текущему поисковому запросу (дедупликация по id на случай дублей в API)
  const queryTrimmed = searchQuery.trim()
  const query = queryTrimmed.toLowerCase()
  const boardsUnique = React.useMemo(() => {
    const byId = new Map<number, KaitenBoard>()
    boards.forEach((b) => byId.set(b.id, b))
    return Array.from(byId.values())
  }, [boards])
  const filteredBoards =
    !query
      ? boardsUnique
      : (() => {
          const isNumericId = /^\d+$/.test(queryTrimmed)
          if (isNumericId) {
            return boardsUnique.filter((b) => String(b.id).trim() === queryTrimmed)
          }
          const filtered = boardsUnique.filter((board) => {
            const name = (board.name || '').toLowerCase()
            const idStr = String(board.id)
            return name.includes(query) || idStr.includes(query)
          })
          return [...filtered].sort((a, b) => {
            const score = (board: KaitenBoard) => {
              const n = (board.name || '').toLowerCase()
              const idStr = String(board.id).trim()
              if (n === query || idStr === queryTrimmed) return 0
              if (n.startsWith(query) || idStr.startsWith(queryTrimmed)) return 1
              if (n.includes(query)) return 2
              return 3
            }
            return score(a) - score(b)
          })
        })()

  if (loading) {
    return <div className={`kaiten-board-selector loading ${className}`}>Загрузка досок...</div>
  }

  if (boards.length === 0) {
    return <div className={`kaiten-board-selector empty ${className}`}>Нет доступных досок</div>
  }

  return (
    <div className={`kaiten-board-selector ${className}`}>
      <div className="kaiten-board-selector-input-wrapper">
        <input
          type="text"
          className={`input input-primary input-small ${hasValue ? 'input-filled' : 'input-default'} kaiten-board-selector-input`}
          placeholder="Выберите доску или введите номер..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleFocus}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />
        {isOpen && (
          <div className="kaiten-board-selector-dropdown">
            <div className="kaiten-board-selector-list">
              {filteredBoards.map((board) => (
                <div
                  key={board.id}
                  className={`kaiten-board-selector-item ${
                    selectedBoardId === board.id ? 'selected' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    const name = board.name || ''
                    setSelectedName(name)
                    onSelect(board)
                    setIsOpen(false)
                    onSearchQueryChange(name)
                  }}
                >
                  <span className="kaiten-board-selector-item-name">{board.name || 'Без названия'}</span>
                  <span className="kaiten-board-selector-item-id">#{board.id}</span>
                </div>
              ))}
              {filteredBoards.length === 0 && (
                <div className="kaiten-board-selector-empty">Доски не найдены</div>
              )}
            </div>
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className="kaiten-board-selector-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
