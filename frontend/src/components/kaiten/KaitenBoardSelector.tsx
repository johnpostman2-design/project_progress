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
  const [selectedBoardName, setSelectedBoardName] = useState<string>('')

  const selectedBoard = boards.find((b) => b.id === selectedBoardId)
  
  // Сохраняем название выбранной доски при изменении selectedBoardId или boards
  // Обновляем только если название изменилось или еще не установлено
  useEffect(() => {
    if (selectedBoardId && selectedBoard?.name) {
      // Обновляем только если название действительно изменилось
      setSelectedBoardName(prev => {
        // Если название уже установлено и совпадает - не обновляем
        if (prev === selectedBoard.name) {
          return prev
        }
        return selectedBoard.name
      })
    } else if (!selectedBoardId) {
      // Сбрасываем только если доска действительно не выбрана
      setSelectedBoardName('')
    }
    // Если доска выбрана, но не найдена в списке - сохраняем текущее название
  }, [selectedBoardId, selectedBoard])
  
  // Синхронизируем searchQuery при закрытии списка
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  // Определяем значение для отображения (ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ДО РАННИХ ВОЗВРАТОВ!)
  const displayValue = React.useMemo(() => {
    if (isOpen) {
      return searchQuery
    }
    // Если список закрыт, показываем название выбранной доски
    // Приоритет: сохраненное название > название из boards > пустая строка
    if (selectedBoardName) {
      return selectedBoardName
    }
    if (selectedBoard?.name) {
      return selectedBoard.name
    }
    return ''
  }, [isOpen, searchQuery, selectedBoardName, selectedBoard])

  const filteredBoards = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return boards

    const words = query.split(/\s+/).filter(Boolean)
    const filtered = boards.filter((board) => {
      const name = (board.name || '').toLowerCase()
      const description = (board.description ?? '').toLowerCase()
      const idStr = String(board.id).toLowerCase()
      const searchable = `${name} ${description} ${idStr}`

      return words.every((word) => searchable.includes(word))
    })

    // Сортировка: точное совпадение и совпадение с начала — в начало списка
    return [...filtered].sort((a, b) => {
      const score = (board: { name?: string; id: number }) => {
        const n = (board.name || '').toLowerCase()
        const id = String(board.id).toLowerCase()
        if (n === query || id === query) return 0
        if (n.startsWith(query) || id.startsWith(query)) return 1
        return 2
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
                    const boardName = board.name || `Доска #${board.id}`
                    setSelectedBoardName(boardName)
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
