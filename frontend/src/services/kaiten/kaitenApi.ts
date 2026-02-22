import {
  KaitenBoard,
  KaitenSpace,
  KaitenGroup,
  KaitenCard,
  KaitenCardsResponse,
  KaitenApiError,
  NetworkError,
  KaitenConfig,
} from './kaitenTypes'

// Default retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

// Все запросы к Kaiten идут через serverless /api/kaiten; токен только на сервере.
const KAITEN_API_PREFIX = '/api/kaiten'

const getBaseUrl = (_config: KaitenConfig): string => KAITEN_API_PREFIX

// Retry wrapper for API calls
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && (error instanceof NetworkError || (error instanceof KaitenApiError && error.statusCode && error.statusCode >= 500))) {
      // Retry on network errors or 5xx errors
      await new Promise((resolve) => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1, delay * 2) // Exponential backoff
    }
    throw error
  }
}

// Make API request with error handling
const apiRequest = async <T>(
  url: string,
  config: KaitenConfig,
  options: RequestInit = {}
): Promise<T> => {
  const baseUrl = getBaseUrl(config)
  // Убеждаемся, что URL начинается с /, если baseUrl не заканчивается на /
  const urlPath = url.startsWith('/') ? url : `/${url}`
  // Формируем полный URL, избегая двойных слешей
  let fullUrl: string
  if (baseUrl.endsWith('/') && urlPath.startsWith('/')) {
    fullUrl = `${baseUrl}${urlPath.substring(1)}`
  } else if (!baseUrl.endsWith('/') && !urlPath.startsWith('/')) {
    fullUrl = `${baseUrl}/${urlPath}`
  } else {
    fullUrl = `${baseUrl}${urlPath}`
  }
  // Все запросы только через /api/kaiten; токен не передаём — используется только в serverless.
  if (typeof window !== 'undefined' && fullUrl.startsWith('http')) {
    fullUrl = `${KAITEN_API_PREFIX}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`
  }

  if (import.meta.env.DEV && !fullUrl.startsWith(KAITEN_API_PREFIX)) {
    console.warn('Kaiten API: ожидается URL /api/kaiten:', fullUrl)
  }

  if (import.meta.env.DEV) {
    console.log('Kaiten API Request:', { url: fullUrl, domain: config.domain })
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    // Токен не отправляем с клиента — serverless подставляет KAITEN_TOKEN.
    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method || '')) {
      headers['Content-Type'] = 'application/json'
    }
    const subdomain = (config.domain || '').trim().replace(/\.kaiten\.ru$/i, '').split('.')[0]
    headers['X-Kaiten-Domain'] = subdomain || config.domain || 'onyagency'

    const requestMethod = options.method || 'GET'
    
    const response = await fetch(fullUrl, {
      ...options,
      method: requestMethod,
      headers,
      mode: 'cors', // Явно указываем CORS режим
      credentials: 'omit', // Не отправляем cookies
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorMessage = `Kaiten API error: ${response.status} ${response.statusText}`
      
      // Добавляем более детальную информацию об ошибке
      if (response.status === 401) {
        errorMessage = 'Ошибка авторизации: проверьте KAITEN_TOKEN на сервере'
      } else if (response.status === 404) {
        const urlMatch = url.match(/\/boards\/(\d+)/)
        // Сообщение про «список пространств» только для запроса именно списка /spaces, не для /spaces/.../boards/...
        if (url === '/spaces' || url === 'spaces') {
          errorMessage = 'Не удалось загрузить список пространств и досок. Проверьте API ключ Kaiten и права доступа (должен быть доступ к пространствам).'
        } else if ((url.includes('/spaces/') && url.includes('/groups')) || (url.includes('/boards/') && (url.includes('/groups') || url.includes('/lanes') || url.includes('/columns')))) {
          errorMessage = 'Не удалось загрузить этапы доски. Проверьте доступ API ключа к доске. Если на локальном хосте всё работает — возможно, у вашего Kaiten другой набор API (версия/эндпоинты).'
        } else if (urlMatch) {
          const boardId = urlMatch[1]
          errorMessage = `Ресурс не найден: доска с ID ${boardId}. Проверьте, что доска существует и API ключ имеет к ней доступ.`
        } else {
          errorMessage = `Ресурс не найден: ${url}. Проверьте API ключ и права доступа в Kaiten.`
        }
      } else if (response.status === 403) {
        errorMessage = 'Доступ запрещен: проверьте права доступа API ключа'
      } else if (response.status === 405) {
        errorMessage = `Метод не разрешен: ${options.method || 'GET'}. URL: ${url}. Возможно, проблема с прокси или неправильный endpoint API. Проверьте, что запрос идет методом GET`
      }
      
      throw new KaitenApiError(
        errorMessage,
        response.status,
        errorText
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof KaitenApiError) {
      throw error
    }
    
    // Более детальная обработка сетевых ошибок
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        // CORS или сетевая ошибка
        console.error('Kaiten API Network Error:', {
          url: fullUrl,
          domain: config.domain,
          error: error.message,
          stack: error.stack,
        })
        
        const errorDetails = `Не удалось выполнить запрос к ${fullUrl}. `
        const possibleCauses = [
          'Проверьте правильность домена Kaiten',
          'Проверьте подключение к интернету',
          'Возможно, требуется настройка CORS на стороне Kaiten'
        ].join('. ')
        
        throw new NetworkError(
          `${errorDetails}${possibleCauses}`,
          error
        )
      }
    }
    
    console.error('Kaiten API Unknown Error:', {
      url: fullUrl,
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name,
    })
    
    throw new NetworkError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}. URL: ${fullUrl}`,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Get all boards from Kaiten
 * 
 * Использует endpoint /spaces, так как /boards не поддерживается
 * Извлекает все boards из всех spaces
 */
export const getBoards = async (config: KaitenConfig): Promise<KaitenBoard[]> => {
  return withRetry(async () => {
    try {
      // Получаем spaces
      const spaces = await apiRequest<KaitenSpace[]>('/spaces', config)
      
      if (!Array.isArray(spaces)) {
        throw new KaitenApiError('Неверный формат ответа от /spaces', 500)
      }
      
      if (import.meta.env.DEV) {
        console.log('[Kaiten API] Spaces response structure:', {
          spacesCount: spaces.length,
          firstSpace: spaces[0] ? {
            id: spaces[0].id,
            name: spaces[0].name,
            hasBoards: !!spaces[0].boards,
            boardsCount: spaces[0].boards ? spaces[0].boards.length : 0,
            keys: Object.keys(spaces[0]),
          } : null,
        })
      }
      
      // Извлекаем все boards из всех spaces
      const allBoardsMap = new Map<number, KaitenBoard>() // Используем Map для удаления дубликатов по ID
      
      for (const space of spaces) {
        if (space.boards && Array.isArray(space.boards)) {
          // Если boards уже есть в space
          space.boards.forEach(board => {
            // Если доска уже есть, обновляем space_id (берем первый встреченный)
            if (!allBoardsMap.has(board.id)) {
              // Нормализуем название доски (может быть name, title или другое поле)
              const normalizedBoard: KaitenBoard = {
                id: board.id,
                name: board.name || (board as any).title || (board as any).name || `Доска #${board.id}`,
                description: board.description || (board as any).description || null,
                created_at: board.created_at || (board as any).created_at || new Date().toISOString(),
                updated_at: board.updated_at || (board as any).updated_at || new Date().toISOString(),
                space_id: space.id,
              }
              allBoardsMap.set(board.id, normalizedBoard)
            }
          })
        } else {
          // Если boards нет в space, пробуем получить их через endpoint /spaces/{spaceId}/boards
          try {
            const spaceBoards = await apiRequest<any[]>(`/spaces/${space.id}/boards`, config)
            if (Array.isArray(spaceBoards)) {
              spaceBoards.forEach(board => {
                // Если доска уже есть, обновляем space_id (берем первый встреченный)
                if (!allBoardsMap.has(board.id)) {
                  // Нормализуем название доски (может быть name, title или другое поле)
                  const normalizedBoard: KaitenBoard = {
                    id: board.id,
                    name: board.name || board.title || `Доска #${board.id}`,
                    description: board.description || null,
                    created_at: board.created_at || new Date().toISOString(),
                    updated_at: board.updated_at || new Date().toISOString(),
                    space_id: space.id,
                  }
                  allBoardsMap.set(board.id, normalizedBoard)
                }
              })
            }
          } catch (err) {
            // Если endpoint не работает, просто пропускаем этот space
            if (import.meta.env.DEV) {
              console.log(`[Kaiten API] Не удалось получить boards для space ${space.id}:`, err)
            }
          }
        }
      }
      
      // Если досок нет (API не отдаёт /spaces/{id}/boards), пробуем GET /boards
      if (allBoardsMap.size === 0) {
        try {
          const allBoardsList = await apiRequest<any[]>('/boards', config)
          if (Array.isArray(allBoardsList)) {
            allBoardsList.forEach((board: any) => {
              const spaceId = board.space_id ?? spaces[0]?.id
              allBoardsMap.set(board.id, {
                id: board.id,
                name: board.name || board.title || `Доска #${board.id}`,
                description: board.description ?? null,
                created_at: board.created_at || new Date().toISOString(),
                updated_at: board.updated_at || new Date().toISOString(),
                space_id: spaceId,
              })
            })
          }
        } catch (_) {}
      }
      
      const allBoards = Array.from(allBoardsMap.values())
      
      if (import.meta.env.DEV) {
        console.log(`[Kaiten API] Found ${allBoards.length} unique boards from ${spaces.length} spaces`)
      }
      
      return allBoards
    } catch (error) {
      if (error instanceof KaitenApiError) {
        throw error
      }
      throw new KaitenApiError(
        `Не удалось получить список досок: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        500
      )
    }
  })
}

/**
 * Get groups (stages) for a board
 */
export const getBoardGroups = async (
  boardId: number,
  config: KaitenConfig
): Promise<KaitenGroup[]> => {
  return withRetry(async () => {
    // Проверяем, что boardId валидный
    if (!boardId || isNaN(boardId)) {
      throw new KaitenApiError(`Неверный ID доски: ${boardId}`, 400)
    }
    
    if (import.meta.env.DEV) {
      console.log('getBoardGroups:', { boardId, spaceId: config.spaceId, domain: config.domain })
    }
    
    // Пробуем получить группы доски: /groups, /lanes, /columns; /entity/; разбор /spaces с вложенными данными
    const mapLanesToGroups = (lanes: any[]) =>
      lanes.map((lane: any) => ({
        id: lane.id,
        name: lane.name || lane.title || 'Без названия',
        board_id: lane.board_id ?? boardId,
        position: lane.position ?? lane.order ?? 0,
        created_at: lane.created_at || new Date().toISOString(),
        updated_at: lane.updated_at || new Date().toISOString(),
      }))
    const findLanesInObject = (obj: any): any[] | null => {
      if (!obj || typeof obj !== 'object') return null
      if (obj.id === boardId) {
        if (Array.isArray(obj.lanes)) return obj.lanes
        if (Array.isArray(obj.groups)) return obj.groups
        if (Array.isArray(obj.columns)) return obj.columns
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findLanesInObject(item)
          if (found) return found
        }
        return null
      }
      for (const v of Object.values(obj)) {
        const found = findLanesInObject(v)
        if (found) return found
      }
      return null
    }
    // Эндпоинт entity (некоторые инстансы Kaiten)
    for (const ep of [`/entities/${boardId}`, `/entity/${boardId}`]) {
      try {
        const data = await apiRequest<any>(ep, config)
        const lanes = findLanesInObject(data)
        if (Array.isArray(lanes)) return mapLanesToGroups(lanes)
      } catch (_) {}
    }
    const endpointsToTry: string[] = [
      `/boards/${boardId}/groups`,
      `/boards/${boardId}/lanes`,
      `/boards/${boardId}/columns`,
      `/board/${boardId}/groups`,
      `/board/${boardId}/lanes`,
      `/board/${boardId}/columns`,
    ]
    for (const endpoint of endpointsToTry) {
      try {
        const data = await apiRequest<any>(endpoint, config)
        if (Array.isArray(data)) {
          const isLaneLike = data.length === 0 || data[0]?.name != null || data[0]?.title != null
          if (isLaneLike) return mapLanesToGroups(data)
          return data as KaitenGroup[]
        }
      } catch (_) {}
    }
    // Fallback: /spaces с expand — ищем доску и этапы во вложенной структуре
    for (const q of ['?expand=boards,boards.lanes', '?expand=boards', '?include=boards']) {
      try {
        const spacesData = await apiRequest<any>(`/spaces${q}`, config)
        const arr = Array.isArray(spacesData) ? spacesData : (spacesData?.data ?? spacesData?.spaces)
        if (Array.isArray(arr)) {
          const lanes = findLanesInObject(arr)
          if (Array.isArray(lanes)) return mapLanesToGroups(lanes)
        }
      } catch (_) {}
    }
    let groupsErr: unknown
    try {
      return await apiRequest<KaitenGroup[]>(`/boards/${boardId}/groups`, config)
    } catch (e) {
      groupsErr = e
      const error = groupsErr
      // Вариант 2: Если есть spaceId, пробуем через space
      if (error instanceof KaitenApiError && error.statusCode === 404 && config.spaceId) {
        if (import.meta.env.DEV) {
          console.log(`[Kaiten API] 404 для /boards/${boardId}/groups, пробуем через space: /spaces/${config.spaceId}/boards/${boardId}/groups`)
        }
        try {
          return await apiRequest<KaitenGroup[]>(`/spaces/${config.spaceId}/boards/${boardId}/groups`, config)
        } catch (spaceError) {
          // Вариант 3: Пробуем получить информацию о доске, возможно группы там
          if (import.meta.env.DEV) {
            console.log(`[Kaiten API] Пробуем получить информацию о доске /boards/${boardId}`)
          }
          try {
            const boardInfo = await apiRequest<any>(`/boards/${boardId}`, config)
            if (import.meta.env.DEV) {
              console.log(`[Kaiten API] Структура ответа о доске:`, {
                hasGroups: !!boardInfo.groups,
                groupsType: Array.isArray(boardInfo.groups) ? 'array' : typeof boardInfo.groups,
                groupsLength: Array.isArray(boardInfo.groups) ? boardInfo.groups.length : 'N/A',
                hasLanes: !!boardInfo.lanes,
                lanesType: Array.isArray(boardInfo.lanes) ? 'array' : typeof boardInfo.lanes,
                lanesLength: Array.isArray(boardInfo.lanes) ? boardInfo.lanes.length : 'N/A',
                keys: Object.keys(boardInfo).slice(0, 20), // Первые 20 ключей
              })
              if (boardInfo.lanes && Array.isArray(boardInfo.lanes) && boardInfo.lanes.length > 0) {
                console.log(`[Kaiten API] Пример lane:`, {
                  id: boardInfo.lanes[0].id,
                  name: boardInfo.lanes[0].name,
                  title: boardInfo.lanes[0].title,
                  allKeys: Object.keys(boardInfo.lanes[0]),
                })
              }
            }
            
            // Проверяем разные возможные поля для групп
            if (boardInfo.groups && Array.isArray(boardInfo.groups)) {
              if (import.meta.env.DEV) {
                console.log(`[Kaiten API] Нашли группы в boardInfo.groups`)
              }
              return boardInfo.groups
            }
            
            // Может быть groups в другом формате или под другим именем
            if (boardInfo.lanes && Array.isArray(boardInfo.lanes)) {
              if (import.meta.env.DEV) {
                console.log(`[Kaiten API] Нашли lanes, используем их как группы. Количество: ${boardInfo.lanes.length}`)
                if (boardInfo.lanes.length > 0) {
                  console.log(`[Kaiten API] Пример структуры lane:`, {
                    id: boardInfo.lanes[0].id,
                    name: boardInfo.lanes[0].name,
                    board_id: boardInfo.lanes[0].board_id,
                    keys: Object.keys(boardInfo.lanes[0]).slice(0, 10),
                  })
                }
              }
              // Маппим lanes в формат KaitenGroup, если нужно
              return boardInfo.lanes.map((lane: any) => ({
                id: lane.id,
                name: lane.name || lane.title || 'Без названия',
                board_id: lane.board_id || boardId,
                position: lane.position || lane.order || 0,
                created_at: lane.created_at || new Date().toISOString(),
                updated_at: lane.updated_at || new Date().toISOString(),
              }))
            }
            
            if (boardInfo.columns && Array.isArray(boardInfo.columns)) {
              if (import.meta.env.DEV) {
                console.log(`[Kaiten API] Нашли columns, используем их как группы`)
              }
              return boardInfo.columns
            }
          } catch (boardError) {
            // Игнорируем ошибку получения информации о доске
            if (import.meta.env.DEV) {
              console.log(`[Kaiten API] Не удалось получить информацию о доске:`, boardError)
            }
          }
          
          // Вариант 4: Пробуем через space получить информацию о доске
          if (config.spaceId) {
            try {
              if (import.meta.env.DEV) {
                console.log(`[Kaiten API] Пробуем получить информацию о доске через space: /spaces/${config.spaceId}/boards/${boardId}`)
              }
              const boardInfo = await apiRequest<any>(`/spaces/${config.spaceId}/boards/${boardId}`, config)
              if (import.meta.env.DEV) {
                console.log(`[Kaiten API] Структура ответа о доске через space:`, {
                  hasGroups: !!boardInfo.groups,
                  groupsType: Array.isArray(boardInfo.groups) ? 'array' : typeof boardInfo.groups,
                  groupsLength: Array.isArray(boardInfo.groups) ? boardInfo.groups.length : 'N/A',
                  keys: Object.keys(boardInfo).slice(0, 20), // Первые 20 ключей
                })
              }
              
              // Проверяем разные возможные поля для групп
              if (boardInfo.groups && Array.isArray(boardInfo.groups)) {
                if (import.meta.env.DEV) {
                  console.log(`[Kaiten API] Нашли группы в boardInfo.groups через space`)
                }
                return boardInfo.groups
              }
              
              if (boardInfo.lanes && Array.isArray(boardInfo.lanes)) {
                if (import.meta.env.DEV) {
                  console.log(`[Kaiten API] Нашли lanes через space, используем их как группы. Количество: ${boardInfo.lanes.length}`)
                }
                // Маппим lanes в формат KaitenGroup, если нужно
                return boardInfo.lanes.map((lane: any) => ({
                  id: lane.id,
                  name: lane.name || lane.title || 'Без названия',
                  board_id: lane.board_id || boardId,
                  position: lane.position || lane.order || 0,
                  created_at: lane.created_at || new Date().toISOString(),
                  updated_at: lane.updated_at || new Date().toISOString(),
                }))
              }
              
              if (boardInfo.columns && Array.isArray(boardInfo.columns)) {
                if (import.meta.env.DEV) {
                  console.log(`[Kaiten API] Нашли columns через space, используем их как группы`)
                }
                return boardInfo.columns
              }
            } catch (spaceBoardError) {
              // Игнорируем ошибку
              if (import.meta.env.DEV) {
                console.log(`[Kaiten API] Не удалось получить информацию о доске через space:`, spaceBoardError)
              }
            }
          }
          
          if (import.meta.env.DEV) {
            console.warn(`[Kaiten API] Все варианты получения групп для доски ${boardId} не сработали. Возвращаем один этап-заглушку.`)
          }
          // Заглушка: один этап, чтобы можно было подключить доску; этапы можно добавить вручную
          return [{
            id: boardId * 1000,
            name: 'Все задачи',
            board_id: boardId,
            position: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]
        }
      } else {
        // Если нет spaceId или другая ошибка, просто пробрасываем
        if (error instanceof KaitenApiError && error.statusCode === 404) {
          if (import.meta.env.DEV) {
            console.warn(`[Kaiten API] 404 для /boards/${boardId}/groups. Возможные причины:
- Доска ${boardId} не существует или была удалена
- API ключ не имеет доступа к этой доске
- Доска находится в space, но space_id не указан в конфигурации`)
          }
        }
        throw error
      }
    }
  })
}

/**
 * Get cards (tasks) by group
 */
export const getCardsByGroup = async (
  groupId: number,
  boardId: number,
  config: KaitenConfig
): Promise<KaitenCard[]> => {
  return withRetry(async () => {
    const response = await apiRequest<KaitenCardsResponse>(
      `/cards?group_id=${groupId}&board_id=${boardId}&limit=1000`,
      config
    )
    return response.data
  })
}

/**
 * Get cards count (tasks count) by group without loading all cards
 * Uses limit=1 to minimize data transfer, but still gets total count
 */
export const getCardsCountByGroup = async (
  groupId: number,
  boardId: number,
  config: KaitenConfig
): Promise<number> => {
  return withRetry(async () => {
    const response = await apiRequest<KaitenCardsResponse>(
      `/cards?group_id=${groupId}&board_id=${boardId}&limit=1`,
      config
    )
    return response.total || 0
  })
}

/**
 * Get single card by ID
 */
export const getCardById = async (
  cardId: number,
  config: KaitenConfig
): Promise<KaitenCard | null> => {
  return withRetry(async () => {
    try {
      const response = await apiRequest<KaitenCard>(
        `/cards/${cardId}`,
        config
      )
      return response
    } catch (error) {
      if (error instanceof KaitenApiError && error.statusCode === 404) {
        return null
      }
      throw error
    }
  })
}

/**
 * Get all cards (tasks) for a board
 */
export const getCardsByBoard = async (
  boardId: number,
  config: KaitenConfig
): Promise<KaitenCard[]> => {
  return withRetry(async () => {
    const response = await apiRequest<KaitenCardsResponse>(
      `/cards?board_id=${boardId}&limit=1000`,
      config
    )
    // Handle both response object and direct array
    if (Array.isArray(response)) {
      return response
    }
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data || []
    }
    console.warn('[Kaiten API] Unexpected response format from getCardsByBoard:', response)
    return []
  })
}

/**
 * Регистрация External Webhook в Kaiten (если API поддерживается).
 * URL вебхука должен указывать на Supabase Edge Function: https://<project-ref>.supabase.co/functions/v1/kaiten-webhook
 * При изменении статуса/карточки на доске Kaiten отправит POST на этот URL.
 * Если эндпоинт недоступен (404/405), настройте вебхук вручную в настройках доски Kaiten.
 */
export const registerWebhook = async (
  boardId: number,
  webhookUrl: string,
  config: KaitenConfig
): Promise<{ ok: boolean; message?: string }> => {
  try {
    await apiRequest<unknown>('/webhooks', config, {
      method: 'POST',
      body: JSON.stringify({
        board_id: boardId,
        url: webhookUrl,
        events: ['card.updated', 'card.moved', 'card.created'],
      }),
    })
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (import.meta.env.DEV) {
      console.warn('[Kaiten API] registerWebhook failed (configure webhook in Kaiten UI if needed):', message)
    }
    return { ok: false, message }
  }
}
