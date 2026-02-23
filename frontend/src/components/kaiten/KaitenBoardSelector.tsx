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

    const queryTrimmed = searchQuery.trim()
    const isNumericId = /^\d+$/.test(queryTrimmed)
    const idNum = isNumericId ? Number(queryTrimmed) : null

    // При вводе числа явно выносим доску с этим ID в самое начало списка
    if (idNum !== null) {
      const exactMatch = filtered.find(
        (b) => Number(b.id) === idNum || String(b.id).trim() === queryTrimmed
      )
      if (exactMatch) {
        const rest = filtered.filter((b) => b.id !== exactMatch.id)
        return [exactMatch, ...rest]
      }
    }

    // Иначе сортировка: точное совпадение названия/ID → начало → вхождение
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
