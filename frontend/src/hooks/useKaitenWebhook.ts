import { useEffect, useRef } from 'react'
import { getSupabaseInstance } from '../services/supabase/supabaseConfig'

export type KaitenWebhookPayload = {
  board_id: string
  event_type?: string
  payload?: unknown
}

/**
 * Подписка на события Kaiten External Webhooks через Supabase Realtime.
 * При получении события (изменение задачи на доске) вызывается onBoardEvent(boardId).
 * Таблица kaiten_webhook_events заполняется Edge Function kaiten-webhook при POST от Kaiten.
 */
export function useKaitenWebhook(onBoardEvent: (boardId: string) => void) {
  const onBoardEventRef = useRef(onBoardEvent)
  onBoardEventRef.current = onBoardEvent

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof getSupabaseInstance>['channel']> | null = null

    try {
      const supabase = getSupabaseInstance()
      channel = supabase
        .channel('kaiten_webhook_events')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'kaiten_webhook_events' },
          (payload) => {
            const row = (payload as unknown as { new?: KaitenWebhookPayload }).new
            if (row?.board_id) {
              if (import.meta.env.DEV) {
                console.log('[useKaitenWebhook] Event received:', row.board_id, row.event_type)
              }
              onBoardEventRef.current(row.board_id)
            }
          }
        )
        .subscribe((status) => {
          if (import.meta.env.DEV && status === 'SUBSCRIBED') {
            console.log('[useKaitenWebhook] Subscribed to kaiten_webhook_events')
          }
        })
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[useKaitenWebhook] Subscribe failed (Supabase not configured?):', e)
      }
    }

    return () => {
      if (channel) {
        getSupabaseInstance().removeChannel(channel)
      }
    }
  }, [])
}
