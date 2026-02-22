// Kaiten API Types based on OpenAPI specification

export interface KaitenBoard {
  id: number
  name: string
  description?: string | null
  created_at: string
  updated_at: string
  space_id?: number // ID space, если доска получена из space
}

export interface KaitenSpace {
  id: number
  name: string
  boards?: KaitenBoard[] // Доски внутри space
  created_at?: string
  updated_at?: string
}

export interface KaitenGroup {
  id: number
  name: string
  board_id: number
  position: number
  created_at: string
  updated_at: string
}

export interface KaitenCardStatus {
  id: number
  name: string
  is_closed: boolean
}

export interface KaitenCard {
  id: number
  title: string
  status: KaitenCardStatus
  group_id: number
  board_id: number
  created_at: string
  updated_at: string
}

export interface KaitenCardsResponse {
  data: KaitenCard[]
  total: number
}

// Error types
export class KaitenApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'KaitenApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Configuration
export interface KaitenConfig {
  domain: string
  apiKey: string
  baseUrl?: string
  boardId?: number // ID доски, если указан в URL при подключении
  spaceId?: number // ID space, если доска находится в space
}
