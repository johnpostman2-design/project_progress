import React, { useState, useEffect } from 'react'
import { KaitenBoard } from '../../services/kaiten/kaitenTypes'
import { Input } from '../common/Input'
import './KaitenBoardSelector.css'

interface KaitenBoardSelectorProps {
  boards: KaitenBoard[]
  selectedBoardId?: number
  onSelect: (board: KaitenBoard) => void
  loading?: boolean
  className?: string
}

export const KaitenBoardSelector: React.FC<KaitenBoardSelectorProps> = ({
  boards,
  selectedBoardId,
  onSelect,
  loading = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedBoard = boards.find((b) => b.id === selectedBoardId)

  // При закрытии списка сбрасываем ввод
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  // В поле всегда показываем только введённый запрос при открытом списке; при закрытом — пусто, чтобы был виден плейсхолдер
  const displayValue = isOpen ? searchQuery : ''

  const filteredBoards = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return boards

    const filtered = boards.filter((board) => {
      const name = (board.name || '').toLowerCase()
      const description = (board.description ?? '').toLowerCase()
      const idStr = String(board.id)
      return name.includes(query) || description.includes(query) || idStr.includes(query)
    })

    // Сортировка: точное совпадение названия/ID → начало названия/ID → вхождение в название → остальные
    return [...filtered].sort((a, b) => {
      const score = (board: KaitenBoard) => {
        const n = (board.name || '').toLowerCase()
        const id = String(board.id)
        if (n === query || id === query) return 0
        if (n.startsWith(query) || id.startsWith(query)) return 1
        if (n.includes(query)) return 2
        return 3
      }
      return score(a) - score(b)
    })
  }, [boards, searchQuery])

  if (loading) {
    return <div className={`kaiten-board-selector loading ${className}`}>Загрузка досок...</div>
  }

  if (boards.length === 0) {
    return <div className={`kaiten-board-selector empty ${className}`}>Нет доступных досок</div>
  }

  return (
    <div className={`kaiten-board-selector ${className}`}>
      <div className="kaiten-board-selector-input-wrapper">
        <Input
          type="primary"
          size="small"
          placeholder="Выберите доску или введите номер..."
          value={displayValue || ''}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (!isOpen) {
              setIsOpen(true)
            }
          }}
          onFocus={() => {
            setIsOpen(true)
            if (selectedBoard) {
              setSearchQuery('')
            }
          }}
          onClick={() => setIsOpen(true)}
          className="kaiten-board-selector-input"
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
                  onClick={() => {
                    onSelect(board)
                    setIsOpen(false)
                    setSearchQuery('')
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
          onClick={() => {
            setIsOpen(false)
            setSearchQuery('')
          }}
        />
      )}
    </div>
  )
}
