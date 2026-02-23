import {
  KaitenBoard,
  KaitenGroup,
  KaitenCard,
  KaitenCardsResponse,
  KaitenApiError,
  NetworkError,
  KaitenConfig,
} from './kaitenTypes'

interface SpaceFromApi {
  id: number
  boards?: Array<{
    id: number
    name?: string
    title?: string
    description?: string | null
    created_at?: string
    updated_at?: string
  }>
}

// Default retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

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

const apiRequest = async <T>(
  url: string,
  config: KaitenConfig,
  options: RequestInit = {}
): Promise<T> => {
  const fullUrl = `/api/kaiten${url.startsWith('/') ? url : `/${url}`}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    headers['Content-Type'] = 'application/json'
  }
  const method = options.method || 'GET'

  try {
    const response = await fetch(fullUrl, { ...options, method, headers, credentials: 'omit' })
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new KaitenApiError(`Kaiten API error: ${response.status}`, response.status, errorText)
    }
    return await response.json()
  } catch (error) {
    if (error instanceof KaitenApiError) throw error
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new NetworkError(`Kaiten API: ${error.message}`, error as Error)
    }
    throw new NetworkError(
      error instanceof Error ? error.message : 'Unknown error',
      error instanceof Error ? error : undefined
    )
  }
}

export const getBoards = async (config: KaitenConfig): Promise<KaitenBoard[]> => {
  const spaces = await apiRequest<SpaceFromApi[]>('/spaces', config)

  if (!Array.isArray(spaces)) {
    throw new KaitenApiError('Invalid /spaces response', 500)
  }

  const boards: KaitenBoard[] = []

  for (const space of spaces) {
    if (Array.isArray(space.boards)) {
      for (const board of space.boards) {
        boards.push({
          id: board.id,
          name: board.name || board.title || `Board #${board.id}`,
          description: board.description ?? null,
          created_at: board.created_at ?? new Date().toISOString(),
          updated_at: board.updated_at ?? new Date().toISOString(),
          space_id: space.id,
        })
      }
    }
  }

  return boards
}

type GroupLike = {
  id: number
  name?: string
  title?: string
  board_id?: number
  position?: number
  order?: number
  created_at?: string
  updated_at?: string
}

function toKaitenGroup(item: GroupLike, boardId: number): KaitenGroup {
  return {
    id: item.id,
    name: item.name || item.title || '',
    board_id: item.board_id ?? boardId,
    position: item.position ?? item.order ?? 0,
    created_at: item.created_at ?? new Date().toISOString(),
    updated_at: item.updated_at ?? new Date().toISOString(),
  }
}

export const getBoardGroups = async (
  boardId: number,
  config: KaitenConfig
): Promise<KaitenGroup[]> => {
  if (!boardId || isNaN(boardId)) {
    throw new KaitenApiError(`Неверный ID доски: ${boardId}`, 400)
  }
  const map = (list: unknown) =>
    Array.isArray(list) ? list.map((item: GroupLike) => toKaitenGroup(item, boardId)) : []

  try {
    const data = await apiRequest<unknown>(`/boards/${boardId}/groups`, config)
    return map(data)
  } catch (e) {
    if (!(e instanceof KaitenApiError) || e.statusCode !== 404) throw e
  }
  try {
    const data = await apiRequest<unknown>(`/boards/${boardId}/lanes`, config)
    return map(data)
  } catch (e) {
    if (!(e instanceof KaitenApiError) || e.statusCode !== 404) throw e
  }
  const data = await apiRequest<unknown>(`/boards/${boardId}/columns`, config)
  return map(data)
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
